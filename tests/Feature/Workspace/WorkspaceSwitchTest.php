<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceSwitchTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_multiple_workspaces_can_switch(): void
    {
        $user = User::factory()->create();
        $workspaceA = Workspace::create(['name' => 'Workspace A']);
        $workspaceB = Workspace::create(['name' => 'Workspace B']);
        $user->workspaces()->attach($workspaceA->id, ['role' => 'owner']);
        $user->workspaces()->attach($workspaceB->id, ['role' => 'editor']);

        session()->put('active_workspace_id', $workspaceA->id);

        $response = $this
            ->actingAs($user)
            ->post(route('workspace.switch', $workspaceB));

        $response->assertRedirect();
        $this->assertEquals($workspaceB->id, session('active_workspace_id'));
    }

    public function test_cannot_switch_to_workspace_user_does_not_belong_to(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'My Workspace']);
        $user->workspaces()->attach($workspace->id, ['role' => 'owner']);

        $otherWorkspace = Workspace::create(['name' => 'Other Workspace']);

        $response = $this
            ->actingAs($user)
            ->post(route('workspace.switch', $otherWorkspace));

        $response->assertForbidden();
    }

    public function test_login_restores_last_active_workspace_from_session(): void
    {
        $user = User::factory()->create();
        $workspaceA = Workspace::create(['name' => 'Workspace A']);
        $workspaceB = Workspace::create(['name' => 'Workspace B']);
        $user->workspaces()->attach($workspaceA->id, ['role' => 'owner']);
        $user->workspaces()->attach($workspaceB->id, ['role' => 'editor']);

        $response = $this
            ->withSession(['active_workspace_id' => $workspaceB->id])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticated();
        $this->assertEquals($workspaceB->id, session('active_workspace_id'));
    }

    public function test_login_with_no_active_session_defaults_to_first_alphabetical_workspace(): void
    {
        $user = User::factory()->create();
        $workspaceB = Workspace::create(['name' => 'Beta Workspace']);
        $workspaceA = Workspace::create(['name' => 'Alpha Workspace']);
        $user->workspaces()->attach($workspaceB->id, ['role' => 'editor']);
        $user->workspaces()->attach($workspaceA->id, ['role' => 'owner']);

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();
        $this->assertEquals($workspaceA->id, session('active_workspace_id'));
    }
}
