<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_transactions_page_is_rendered(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->withoutVite()
            ->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('transactions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Transactions/Index'));
    }

    public function test_transactions_api_lists_only_active_workspace_transactions(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create(['workspace_id' => $workspace->id]);
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $otherAccount = Account::factory()->create(['workspace_id' => $otherWorkspace->id]);

        Transaction::factory()->create([
            'workspace_id' => $workspace->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'description' => 'Mercado',
        ]);

        Transaction::factory()->create([
            'workspace_id' => $otherWorkspace->id,
            'account_id' => $otherAccount->id,
            'description' => 'Externo',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->getJson(route('api.accounts.transactions', $account));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.description', 'Mercado');
    }

    public function test_transactions_page_receives_accounts_for_novo_gasto_entry_point(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Conta Principal',
        ]);

        $response = $this->withoutVite()
            ->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Transactions/Index')
            ->has('accounts', 1)
            ->where('selectedAccountId', null)
            ->where('accounts.0.id', $account->id)
            ->where('accounts.0.name', 'Conta Principal'));
    }

    public function test_transactions_page_restores_selected_account_from_session(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->withoutVite()
            ->actingAs($user)
            ->withSession([
                'active_workspace_id' => $workspace->id,
                'transactions.selected_account_id' => $account->id,
            ])
            ->get(route('transactions.index'));

        $response->assertInertia(fn ($page) => $page->where('selectedAccountId', $account->id));
    }

    public function test_selected_account_can_be_persisted_in_session(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->putJson(route('transactions.selected-account.update'), [
                'account_id' => $account->id,
            ]);

        $response->assertNoContent();
        $this->assertSame($account->id, session('transactions.selected_account_id'));
    }

    private function createOwnerWithWorkspace(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        return [$user, $workspace];
    }
}
