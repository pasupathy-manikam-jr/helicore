# Helicore

An ERP for a flange sealing manufacturer — spiral wound, ring type joint and
kammprofile gaskets, and G10 insulation kits, made to ASME B16.20 and API 6A.

This is a rewrite of a Laravel 11 + Blade/jQuery application onto Laravel 13,
Inertia 3, React 19 and Tailwind 4, module by module, against the original
database.

## Modules

| Module                                                         | State                               |
| -------------------------------------------------------------- | ----------------------------------- |
| Dashboard                                                      | Ported                              |
| Suppliers, supplier categories                                 | Ported                              |
| Clients, delivery addresses                                    | Ported                              |
| Products (stock codes)                                         | Ported                              |
| Quotations                                                     | List, detail, header and line items |
| Utilities (currency, tariff, shipping mode, tax, terms)        | Ported                              |
| Admin (users, roles, permissions)                              | Ported                              |
| Sales order, work order, delivery order, invoice, AFE, reports | To do                               |

## Stack

- PHP 8.4, Laravel 13, Inertia 3, Fortify, spatie/laravel-permission
- React 19, TypeScript, Tailwind 4, TanStack Table v9, shadcn/ui
- Laravel Wayfinder for typed routes, PHPUnit for tests

## Running it

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
npm run build
php artisan serve
```

The schema predates this application: its tables already exist in the
production database, so `php artisan migrate` is only ever run against the
sqlite database the tests build. Feature tests create the legacy tables they
need in `setUp()`.

## Conventions

- Listings use a shared `DataTable`; processing is client side except
  quotations, which page and filter in SQL.
- Forms carry no HTML5 validation attributes. Laravel is the only validator.
- Deleting is refused wherever it would orphan data.

```bash
vendor/bin/pint && npm run types:check && npm run check:fix && vendor/bin/phpunit
```
