<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToWorkspace
{
    public static function bootBelongsToWorkspace(): void
    {
        static::addGlobalScope('workspace', function (Builder $builder) {
            $workspaceId = session('active_workspace_id')
                ?? request()->attributes->get('active_workspace_id');

            if ($workspaceId) {
                $builder->where($builder->getModel()->getTable() . '.workspace_id', $workspaceId);
            }
        });

        static::creating(function (Model $model) {
            if (!$model->workspace_id) {
                $model->workspace_id = session('active_workspace_id')
                    ?? request()->attributes->get('active_workspace_id');
            }
        });
    }
}
