<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_transfer_between_two_accounts_updates_both_balances(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id, 'initial_balance' => 200_000]);
        $destination = Account::factory()->create(['workspace_id' => $workspace->id, 'initial_balance' => 50_000]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 50_000,
                'date' => '2026-05-06',
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(150_000, $source->fresh()->balance());
        $this->assertSame(100_000, $destination->fresh()->balance());
    }

    public function test_transfer_creates_linked_transactions_with_same_transfer_id(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id]);
        $destination = Account::factory()->create(['workspace_id' => $workspace->id]);

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 50_000,
            ]);

        $transactions = Transaction::query()->orderBy('id')->get();

        $this->assertCount(2, $transactions);
        $this->assertSame('transfer_out', $transactions[0]->type);
        $this->assertSame('transfer_in', $transactions[1]->type);
        $this->assertSame($transactions[0]->transfer_id, $transactions[1]->transfer_id);
    }

    public function test_transfer_to_same_account_is_rejected(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $account), [
                'destination_account_id' => $account->id,
                'amount' => 10_000,
            ]);

        $response->assertSessionHasErrors('destination_account_id');
    }

    public function test_transfer_with_zero_amount_is_rejected(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id]);
        $destination = Account::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 0,
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_transfer_amount_exceeding_balance_is_allowed(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id, 'initial_balance' => 1_000]);
        $destination = Account::factory()->create(['workspace_id' => $workspace->id, 'initial_balance' => 0]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 999_999,
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(-998_999, $source->fresh()->balance());
        $this->assertSame(999_999, $destination->fresh()->balance());
    }

    public function test_transfer_to_account_in_another_workspace_is_rejected(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id]);
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $destination = Account::factory()->create(['workspace_id' => $otherWorkspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 10_000,
            ]);

        $response->assertSessionHasErrors('destination_account_id');
    }

    public function test_transfer_api_lists_account_transactions(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create(['workspace_id' => $workspace->id]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $workspace->id,
            'type' => 'credit',
            'amount' => 20_000,
            'description' => 'Receita',
            'date' => '2026-05-06',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->getJson(route('api.accounts.transactions', $account));

        $response->assertOk();
        $response->assertJsonPath('data.0.type', 'credit');
        $response->assertJsonPath('data.0.amount', 20_000);
    }

    public function test_transfer_description_is_optional(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $source = Account::factory()->create(['workspace_id' => $workspace->id]);
        $destination = Account::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transfer', $source), [
                'destination_account_id' => $destination->id,
                'amount' => 10_000,
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertDatabaseHas('transactions', [
            'account_id' => $source->id,
            'description' => 'Transferência entre contas',
        ]);
    }

    private function createOwnerWithWorkspace(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        return [$user, $workspace];
    }
}
