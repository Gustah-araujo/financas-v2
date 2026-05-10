<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_a_debit_transaction_recalculates_balance(): void
    {
        [$user, $workspace, $account, $transaction] = $this->createTransaction();

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('accounts.transactions.update', [$account, $transaction]), [
                'amount' => 3_000,
                'description' => 'Mercado maior',
                'date' => '2026-05-06',
                'category_id' => $transaction->category_id,
            ])
            ->assertRedirect(route('transactions.index'));

        $this->assertSame(7_000, $account->fresh()->balance());
    }

    public function test_deleting_a_debit_transaction_restores_balance(): void
    {
        [$user, $workspace, $account, $transaction] = $this->createTransaction();

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('accounts.transactions.destroy', [$account, $transaction]))
            ->assertRedirect(route('transactions.index'));

        $this->assertSame(10_000, $account->fresh()->balance());
    }

    public function test_update_is_scoped_to_original_account_and_workspace(): void
    {
        [$user, $workspace, $account, $transaction] = $this->createTransaction();
        $otherAccount = Account::factory()->create(['workspace_id' => $workspace->id]);

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('accounts.transactions.update', [$otherAccount, $transaction]), [
                'amount' => 1_000,
                'description' => 'Tentativa',
                'date' => '2026-05-06',
                'category_id' => $transaction->category_id,
            ])
            ->assertNotFound();
    }

    public function test_delete_is_scoped_to_original_account_and_workspace(): void
    {
        [$user, $workspace, $account, $transaction] = $this->createTransaction();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $otherAccount = Account::factory()->create(['workspace_id' => $otherWorkspace->id]);

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('accounts.transactions.destroy', [$otherAccount, $transaction]))
            ->assertNotFound();
    }

    private function createTransaction(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
            'initial_balance' => 10_000,
        ]);
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);
        $transaction = Transaction::factory()->create([
            'workspace_id' => $workspace->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'debit',
            'amount' => 1_000,
        ]);

        return [$user, $workspace, $account, $transaction];
    }
}
