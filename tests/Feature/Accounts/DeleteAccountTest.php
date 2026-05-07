<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_deletes_account_without_transactions(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('accounts.destroy', $account));

        $response->assertRedirect(route('accounts.index'));

        $this->assertDatabaseMissing('accounts', [
            'id' => $account->id,
        ]);
    }

    public function test_user_cannot_delete_account_with_transactions(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $account = Account::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('accounts.destroy', $account));

        $response->assertSessionHasErrors([
            'account' => 'Conta possui movimentações. Remova as transações primeiro.',
        ]);

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
        ]);
    }

    public function test_user_cannot_delete_account_from_another_workspace(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $account = Account::factory()->create([
            'workspace_id' => $otherWorkspace->id,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('accounts.destroy', $account));

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
