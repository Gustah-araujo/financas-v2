<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Category;
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
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 20_000,
                'description' => 'Mercado',
                'date' => '2026-05-06',
                'category_id' => $category->id,
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(80_000, $account->fresh()->balance());
    }

    public function test_user_creates_credit_transaction(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount(100_000);
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 50_000,
                'description' => 'Salário',
                'category_id' => $category->id,
            ]);

        $response->assertRedirect(route('accounts.index'));
        $this->assertSame(150_000, $account->fresh()->balance());
    }

    public function test_transaction_with_zero_amount_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 0,
                'description' => 'Mercado',
                'category_id' => $category->id,
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_transaction_with_negative_amount_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => -100,
                'description' => 'Mercado',
                'category_id' => $category->id,
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_transaction_without_description_is_rejected(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 100,
                'description' => '',
                'category_id' => $category->id,
            ]);

        $response->assertSessionHasErrors('description');
    }

    public function test_transaction_without_date_defaults_to_today(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 10_000,
                'description' => 'Entrada',
                'category_id' => $category->id,
            ]);

        $transaction = Transaction::query()->latest('id')->first();

        $this->assertNotNull($transaction);
        $this->assertSame(now()->toDateString(), $transaction->date?->format('Y-m-d'));
    }

    public function test_transaction_with_future_date_is_allowed(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'credit',
                'amount' => 10_000,
                'description' => 'Recebimento futuro',
                'date' => '2027-01-01',
                'category_id' => $category->id,
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

    public function test_debit_transaction_requires_category_from_active_workspace(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $foreignCategory = Category::factory()->create(['workspace_id' => $otherWorkspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 100,
                'description' => 'Mercado',
                'category_id' => $foreignCategory->id,
            ]);

        $response->assertSessionHasErrors('category_id');
    }

    public function test_debit_transaction_warns_when_balance_goes_negative_but_is_still_saved(): void
    {
        [$user, $workspace, $account] = $this->createOwnerWorkspaceAndAccount(1_000);
        $category = Category::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.transactions.store', $account), [
                'type' => 'debit',
                'amount' => 5_000,
                'description' => 'Conta atrasada',
                'category_id' => $category->id,
                'redirect_to' => route('transactions.index'),
            ]);

        $response->assertRedirect(route('transactions.index'));
        $response->assertSessionHas('warning');
        $this->assertSame(-4_000, $account->fresh()->balance());
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
