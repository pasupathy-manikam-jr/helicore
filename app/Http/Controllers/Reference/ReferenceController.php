<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared CRUD for the small reference tables behind the Utilities menu. Each
 * subclass declares its model, its permissions and its fields; the field
 * declaration drives both the validation rules and the React form, so the two
 * cannot drift apart.
 */
abstract class ReferenceController extends Controller implements HasMiddleware
{
    /** Permission prefix, e.g. `currency` for `currency-create`. */
    protected const PERMISSION = '';

    /** Spelled out because the legacy data uses `tax-index`, not `tax-list`. */
    protected const LIST_PERMISSION = '';

    /** @return class-string<Model> */
    abstract protected function model(): string;

    /**
     * @return array{title: string, description: string, singular: string, basePath: string}
     */
    abstract protected function meta(): array;

    /**
     * @return array<int, array{name: string, label: string, type: string, required?: bool, unique?: bool, help?: string}>
     */
    abstract protected function fields(): array;

    /**
     * Tables that point at this one, as [table, column]. A row still in use is
     * refused rather than deleted, which would leave those rows orphaned.
     *
     * @return array<int, array{0: string, 1: string}>
     */
    protected function usedBy(): array
    {
        return [];
    }

    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        $permission = static::PERMISSION;

        return [
            'auth',
            new Middleware('permission:'.static::LIST_PERMISSION, only: ['index']),
            new Middleware("permission:{$permission}-create", only: ['store']),
            new Middleware("permission:{$permission}-edit", only: ['update']),
            new Middleware("permission:{$permission}-delete", only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $fields = $this->fields();
        $columns = array_column($fields, 'name');

        return Inertia::render('reference/index', [
            'resource' => $this->meta(),
            'fields' => $fields,
            'rows' => $this->model()::query()
                ->orderBy($columns[0])
                ->get(['id', ...$columns]),
            'can' => [
                'create' => $request->user()->can(static::PERMISSION.'-create'),
                'edit' => $request->user()->can(static::PERMISSION.'-edit'),
                'delete' => $request->user()->can(static::PERMISSION.'-delete'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->model()::create($request->validate($this->rules()));

        return $this->done('created');
    }

    public function update(Request $request, int|string $id): RedirectResponse
    {
        $record = $this->model()::findOrFail($id);
        $record->update($request->validate($this->rules($record->getKey())));

        return $this->done('updated');
    }

    public function destroy(int|string $id): RedirectResponse
    {
        $record = $this->model()::findOrFail($id);

        if ($blocker = $this->inUse($record->getKey())) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Still referenced by {$blocker}, so it cannot be deleted.",
            ]);

            return back();
        }

        $record->delete();

        return $this->done('deleted');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(int|string|null $ignore = null): array
    {
        $table = (new ($this->model()))->getTable();
        $rules = [];

        foreach ($this->fields() as $field) {
            $rule = [($field['required'] ?? true) ? 'required' : 'nullable'];

            $rule[] = match ($field['type']) {
                'number' => 'numeric',
                'textarea' => 'string',
                default => 'string',
            };

            if ($field['type'] === 'text') {
                $rule[] = 'max:255';
            }

            if ($field['unique'] ?? false) {
                $rule[] = Rule::unique($table, $field['name'])->ignore($ignore);
            }

            $rules[$field['name']] = $rule;
        }

        return $rules;
    }

    /** Returns the first referencing table that still holds this id. */
    private function inUse(int|string $id): ?string
    {
        foreach ($this->usedBy() as [$table, $column]) {
            if (DB::table($table)->where($column, $id)->exists()) {
                return str_replace('_', ' ', $table);
            }
        }

        return null;
    }

    private function done(string $verb): RedirectResponse
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->meta()['singular']." {$verb}.",
        ]);

        return back();
    }
}
