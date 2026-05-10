<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_page_is_rendered_for_active_workspace(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $response = $this->withoutVite()
            ->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->get(route('categories.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Categories/Index'));
    }

    public function test_user_can_create_update_and_delete_categories_within_active_workspace(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('categories.store'), ['name' => 'Mercado'])
            ->assertRedirect(route('categories.index'));

        $category = Category::query()->where('name', 'Mercado')->firstOrFail();

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('categories.update', $category), ['name' => 'Supermercado'])
            ->assertRedirect(route('categories.index'));

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->delete(route('categories.destroy', $category->fresh()))
            ->assertRedirect(route('categories.index'));

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_validation_rejects_invalid_names_and_workspace_mismatched_categories(): void
    {
        [$user, $workspace] = $this->createOwnerWithWorkspace();
        $otherWorkspace = Workspace::create(['name' => 'Outro Workspace']);
        $foreignCategory = Category::factory()->create(['workspace_id' => $otherWorkspace->id]);

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->post(route('categories.store'), ['name' => ''])
            ->assertSessionHasErrors('name');

        $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->patch(route('categories.update', $foreignCategory), ['name' => 'Tentativa'])
            ->assertNotFound();
    }

    private function createOwnerWithWorkspace(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        return [$user, $workspace];
    }
}
