<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_updates_account_name_and_type_without_changing_initial_balance(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Conta Antiga',
            'type' => 'checking',
            'initial_balance' => 100_000,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('accounts.update', $account), [
                'name' => 'Conta Nova',
                'type' => 'savings',
                'initial_balance' => 999_999,
            ]);

        $response->assertRedirect(route('accounts.index'));

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'name' => 'Conta Nova',
            'type' => 'savings',
            'initial_balance' => 100_000,
        ]);
    }

    public function test_name_is_required_when_updating_account(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('accounts.update', $account), [
                'name' => '',
                'type' => 'checking',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_user_cannot_update_account_from_another_workspace(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $account = Account::factory()->create([
            'workspace_id' => $otherWorkspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('accounts.update', $account), [
                'name' => 'Conta Nova',
                'type' => 'checking',
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
}
