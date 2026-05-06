<?php

namespace Tests\Feature\Workspace;

use App\Mail\WorkspaceInvitationMail;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_generate_invitation(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::create(['name' => 'My Workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->postJson(route('workspace.invite'));

        $response->assertStatus(200);
        $response->assertJsonStructure(['invite_link', 'token']);
        $response->assertJsonPath('token', fn ($token) => $token !== null);
    }

    public function test_invitation_link_includes_valid_uuid_token(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::create(['name' => 'My Workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->postJson(route('workspace.invite'));

        $response->assertStatus(200);

        $token = $response->json('token');
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            $token
        );

        $inviteLink = $response->json('invite_link');
        $this->assertStringContainsString($token, $inviteLink);
    }

    public function test_owner_can_optionally_provide_email_and_mail_is_sent(): void
    {
        Mail::fake();

        $owner = User::factory()->create();
        $workspace = Workspace::create(['name' => 'My Workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->postJson(route('workspace.invite'), [
                'email' => 'invited@example.com',
            ]);

        $response->assertStatus(200);

        Mail::assertSent(WorkspaceInvitationMail::class, function ($mail) {
            return $mail->hasTo('invited@example.com');
        });
    }

    public function test_editor_cannot_generate_invitation(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $workspace = Workspace::create(['name' => 'My Workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);
        $workspace->users()->attach($editor->id, ['role' => 'editor']);

        $response = $this->actingAs($editor)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->postJson(route('workspace.invite'));

        $response->assertStatus(403);
    }
}
