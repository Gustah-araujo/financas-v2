<?php

namespace Tests\Feature\Workspace;

use App\Models\Category;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceCategorySeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_workspace_receives_default_categories_without_duplicates(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('workspaces.store'), [
            'name' => 'Meu Workspace',
        ])->assertRedirect(route('dashboard'));

        $workspace = Workspace::query()->where('name', 'Meu Workspace')->firstOrFail();

        $this->assertCount(count(Category::DEFAULTS), $workspace->categories);

        DatabaseSeeder::seedWorkspaceCategories($workspace);

        $this->assertCount(count(Category::DEFAULTS), $workspace->fresh()->categories);
    }
}
