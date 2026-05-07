<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_creates_debit_transaction(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount(100_000);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 20_000,
                'description' => 'Mercado',
                'date' => '2026-05-06',
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(80_000, $account->fresh()->balance());
    }

    public function test_user_creates_credit_transaction(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount(100_000);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 50_000,
                'description' => 'Salário',
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(150_000, $account->fresh()->balance());
    }

    public function test_transaction_with_zero_amount_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 0,
                'description' => 'Mercado',
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_transaction_with_negative_amount_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => -100,
                'description' => 'Mercado',
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_transaction_without_description_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 100,
                'description' => '',
            ]);

        $response->assertSessionHasErrors('description');
    }

    public function test_transaction_without_date_defaults_to_today(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 10_000,
                'description' => 'Entrada',
            ]);

        $transaction = Transaction::query()->latest('id')->first();

        $this->assertNotNull($transaction);
        $this->assertSame(now()->toDateString(), $transaction->date?->format('Y-m-d'));
    }

    public function test_transaction_with_future_date_is_allowed(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 10_000,
                'description' => 'Recebimento futuro',
                'date' => '2027-01-01',
            ]);

        $response->assertRedirect(route('accounts.index'));
    }

    public function test_balance_is_computed_after_multiple_transactions(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount(100_000);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $workspace->id,
            'type' => 'debit',
            'amount' => 20_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $workspace->id,
            'type' => 'credit',
            'amount' => 50_000,
        ]);

        $this->assertSame(130_000, $account->fresh()->balance());
    }

    public function test_transaction_on_non_existent_account_returns_not_found(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post('/accounts/999/transactions', [
                'type' => 'credit',
                'amount' => 10_000,
                'description' => 'Teste',
            ]);

        $response->assertNotFound();
    }

    private function createOwnerWithWorkspace(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        return [$user, $workspace];
    }

    private function createOwnerWorkspaceAndAccount(int $initialBalance = 0): array
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
            'initial_balance' => $initialBalance,
        ]);

        return [$user, $workspace, $account];
    }
}
