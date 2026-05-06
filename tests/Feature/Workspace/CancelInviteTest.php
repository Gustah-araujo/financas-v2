<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CancelInviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_cancel_pending_invitation(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Test Workspace', 'slug' => 'test-workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $invitation = $workspace->invitations()->make([
            'email' => 'invited@example.com',
            'token' => (string) Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->created_by = $owner->id;
        $invitation->save();

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('workspace.invitations.destroy', $invitation));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertNotNull($invitation->fresh()->cancelled_at);
    }

    public function test_editor_cannot_cancel_invitation(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Test Workspace', 'slug' => 'test-workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);

        $invitation = $workspace->invitations()->make([
            'email' => 'invited@example.com',
            'token' => (string) Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->created_by = $owner->id;
        $invitation->save();

        $response = $this->actingAs($editor)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('workspace.invitations.destroy', $invitation));

        $response->assertForbidden();
        $this->assertNull($invitation->fresh()->cancelled_at);
    }
}
