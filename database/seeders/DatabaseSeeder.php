<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    public static function seedWorkspaceCategories(Workspace $workspace): void
    {
        foreach (Category::DEFAULTS as $name) {
            $workspace->categories()->firstOrCreate([
                'name' => $name,
            ]);
        }
    }
}
