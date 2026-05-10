<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::create([
                'name' => fake()->unique()->company(),
            ])->id,
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
