<?php

namespace Tests\Unit;

use App\Models\WorkspaceInvitation;
use Tests\TestCase;

class InvitationValidationTest extends TestCase
{
    public function test_is_valid_returns_true_for_fresh_invitation(): void
    {
        $invitation = new WorkspaceInvitation([
            'token' => '550e8400-e29b-41d4-a716-446655440000',
            'expires_at' => now()->addDay(),
        ]);

        $this->assertTrue($invitation->isValid());
    }

    public function test_is_valid_returns_false_when_expired(): void
    {
        $invitation = new WorkspaceInvitation([
            'token' => '550e8400-e29b-41d4-a716-446655440000',
            'expires_at' => now()->subDay(),
        ]);

        $this->assertFalse($invitation->isValid());
    }

    public function test_is_valid_returns_false_when_accepted(): void
    {
        $invitation = new WorkspaceInvitation([
            'token' => '550e8400-e29b-41d4-a716-446655440000',
            'expires_at' => now()->addDay(),
        ]);

        $invitation->accepted_at = now();

        $this->assertFalse($invitation->isValid());
    }

    public function test_is_valid_returns_false_when_cancelled(): void
    {
        $invitation = new WorkspaceInvitation([
            'token' => '550e8400-e29b-41d4-a716-446655440000',
            'expires_at' => now()->addDay(),
        ]);

        $invitation->cancelled_at = now();

        $this->assertFalse($invitation->isValid());
    }
}
