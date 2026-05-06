<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:owner,editor'],
        ];
    }
}
