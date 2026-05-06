<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_members_list(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->withoutVite()
            ->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('workspace.members'));

        $response->assertStatus(200);
    }

    public function test_editor_cannot_view_members_list(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);

        $response = $this->actingAs($editor)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('workspace.members'));

        $response->assertStatus(403);
    }

    public function test_owner_can_change_member_role(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('workspace.members.update-role', $editor), [
                'role' => 'owner',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $editor->id,
            'role' => 'owner',
        ]);
    }

    public function test_owner_cannot_demote_self_if_last_owner(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('workspace.members.update-role', $owner), [
                'role' => 'editor',
            ]);

        $response->assertRedirect();

        $response->assertSessionHas('error');

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
    }

    public function test_owner_can_demote_self_if_another_owner_exists(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $otherOwner = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($otherOwner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('workspace.members.update-role', $owner), [
                'role' => 'editor',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => 'editor',
        ]);
    }

    public function test_owner_can_remove_member(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('workspace.members.destroy', $editor));

        $response->assertRedirect();

        $this->assertDatabaseMissing('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $editor->id,
        ]);
    }

    public function test_owner_cannot_remove_last_owner(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('workspace.members.destroy', $owner));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
    }

    public function test_editor_cannot_remove_member(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $otherEditor = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);
        $workspace->users()->attach($otherEditor->id, ['role' => 'editor']);

        $response = $this->actingAs($editor)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('workspace.members.destroy', $otherEditor));

        $response->assertStatus(403);
    }

    public function test_editor_cannot_change_roles(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $otherEditor = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);
        $workspace->users()->attach($otherEditor->id, ['role' => 'editor']);

        $response = $this->actingAs($editor)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('workspace.members.update-role', $otherEditor), [
                'role' => 'owner',
            ]);

        $response->assertStatus(403);
    }
}
