<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_accounts_page_is_rendered(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->withoutVite()
            ->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('accounts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Accounts'));
    }

    public function test_user_creates_account_with_valid_data(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.store'), [
                'name' => 'Conta Corrente',
                'type' => 'checking',
                'initial_balance' => 100_000,
            ]);

        $response->assertRedirect(route('accounts.index'));

        $this->assertDatabaseHas('accounts', [
            'workspace_id' => $workspace->id,
            'name' => 'Conta Corrente',
            'type' => 'checking',
            'initial_balance' => 100_000,
        ]);
    }

    public function test_user_creates_account_with_zero_initial_balance(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.store'), [
                'name' => 'Carteira',
                'type' => 'wallet',
                'initial_balance' => 0,
            ]);

        $response->assertRedirect(route('accounts.index'));

        $this->assertDatabaseHas('accounts', [
            'workspace_id' => $workspace->id,
            'name' => 'Carteira',
            'type' => 'wallet',
            'initial_balance' => 0,
        ]);
    }

    public function test_name_is_required_when_creating_account(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.store'), [
                'name' => '',
                'type' => 'checking',
                'initial_balance' => 0,
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_type_must_be_valid_when_creating_account(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('accounts.store'), [
                'name' => 'Teste',
                'type' => 'invalid',
                'initial_balance' => 0,
            ]);

        $response->assertSessionHasErrors('type');
    }

    public function test_api_lists_only_accounts_from_active_workspace_with_computed_balances(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);

        $primaryAccount = Account::factory()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Conta Principal',
            'type' => 'checking',
            'initial_balance' => 100_000,
        ]);

        Account::factory()->create([
            'workspace_id' => $otherWorkspace->id,
            'name' => 'Conta Externa',
        ]);

        Transaction::factory()->create([
            'account_id' => $primaryAccount->id,
            'workspace_id' => $workspace->id,
            'type' => 'credit',
            'amount' => 20_000,
            'description' => 'Entrada',
            'date' => '2026-05-06',
        ]);

        Transaction::factory()->create([
            'account_id' => $primaryAccount->id,
            'workspace_id' => $workspace->id,
            'type' => 'debit',
            'amount' => 5_000,
            'description' => 'Saida',
            'date' => '2026-05-06',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->getJson(route('api.accounts.index'));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.name', 'Conta Principal');
        $response->assertJsonPath('data.0.balance', 115_000);
    }

    public function test_guest_cannot_create_account(): void
    {
        $response = $this->post(route('accounts.store'), [
            'name' => 'Conta',
            'type' => 'checking',
            'initial_balance' => 0,
        ]);

        $response->assertRedirect('/login');
    }

    public function test_user_without_workspace_is_redirected_to_onboarding_when_creating_account(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('accounts.store'), [
                'name' => 'Conta',
                'type' => 'checking',
                'initial_balance' => 0,
            ]);

        $response->assertRedirect(route('onboarding'));
    }

    private function createOwnerWithWorkspace(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        return [$user, $workspace];
    }
}
