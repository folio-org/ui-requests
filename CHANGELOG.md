# Change history for ui-requests

## IN PROGRESS

* Fix bug preventing item view accordions from closing. Fixes UIREQ-123.
* Fix bug causing barcode validation to misbehave. Fixes UIREQ-127.
* Refactor requests app to address UIREQ-124, UIREQ-132 and UIREQ-126.
* Show `active` column in find-user popup. Refs STCOM-385.
* Populate pickup service point with service points. Fixes UIREQ-131.
* Configure 'Requests: All permissions' permission set. Fixes UIREQ-106.
* Show No Requests By Default. Fixes UIREQ-150.
* Support circulation v5.0, requiring service-point information on loans. Refs UIREQ-161.
* Use documented react-intl patterns instead of stripes.intl. UIREQ-135
* Improve opening request record. Fixes UIREQ-134.
* Removed deprecated actionMenuItems-prop. Fixes UIREQ-170.

## 1.4.1 (https://github.com/folio-org/ui-requests/tree/v1.4.1) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.4.0...v1.4.1)

* Fix `exportCsv` import

## 1.4.0 (https://github.com/folio-org/ui-requests/tree/v1.4.0) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.3.0...v1.4.0)

* Link to request queue from detailed view, refs UIREQ-122
* Fix filters2cql import

## 1.3.0 (https://github.com/folio-org/ui-requests/tree/v1.3.0) (2018-10-03)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.2.0...v1.3.0)

* Add alternate dependency `inventory` 7.0. Completes UIREQ-115
* Update `stripes-form` dependency to v1.0.0.
* Fix case-sensitive filter tests. Fixes UIREQ-119.
* Remove notes helper app
* Copy `craftLayerUrl()` from `stripes-components`
* Use `stripes` 1.0 framework

## 1.2.0 (https://github.com/folio-org/ui-requests/tree/v1.2.0) (2018-09-10)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.1.0...v1.2.0)

* Refactor code to use `<SearchAndSort>` component. Completes UIREQ-49.
* Include clear-filter handlers. Refs STRIPES-495.
* rewire loan links from items to inventory so we can deprecate items! Fixes UIREQ-57.
* Display request date AND time in search results, and make that the primary sort. Completes UIREQ-3.
* Improve barcode lookups and display of results in the new request form. Completes UIREQ-2.
* Refine UI throughout the app. Completes UIREQ-62, UIREQ-63, UIREQ-64.
* Add a filter for request status. Completes UIREQ-42.
* Upgrade query-string dependency to eliminate duplicate package warning. Fixes UIREQ-71. Available after v1.1.1.
* Lint. Fixes UIREQ-19. Available after v1.1.2.
* Pass packageInfo to SearchAndSort; it's simpler. Refs STSMACOM-64. Available after v1.1.3.
* Add validation for holds. Fixes UIREQ-52.
* Remove notes-related permissions. Fixes UIREQ-73.
* Ignore yarn-error.log. Refs STRIPES-517.
* Bug fix: pass MCL keys, not values, to patron lookup. Fixes UIREQ-76.
* Bug fix: display item-details on request-edit pane. Refs UIREQ-55.
* Prefer metadata over metaData. One case to rule them all! Refs UIREQ-80.
* Refactor fetching and structure of extended request object.
* Implement request by proxy. Completes UIREQ-50.
* Accommodate ui-users "show inactive users" filter. Refs UIU-400.
* Show full metadata section where needed. Fixes UIREQ-86.
* Add padding to bottom of create form (seemingly a Windows-specific issue). Fixes UIREQ-85.
* Change 'Author' label to 'Contributor'. Fixes UIREQ-93.
* Add a guard against calling setState after component is unmounted. Fixes UIREQ-26.
* Use perm or temp location in item summary. Fixes UIREQ-29.
* Bug fix: make proxy modal cancellable (is that a word?). Fixes UIREQ-94.
* Restore "active/inactive" filters since UIU-400 remains incomplete.
* Don't choke on undefined instance.contributors[0].
* Fix input field value reference. Fixes UIREQ-96.
* Added ability to cancel requests. Fixes UIREQ-58 and UIREQ-67.
* Depend on "5.0 6.0" of "inventory". MODINV-56.
* Use effectiveLocation in item displays. Completes UIREQ-29 and UIREQ-98.

## [1.1.0](https://github.com/folio-org/ui-requests/tree/v1.1.0) (2018-01-04)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.0.0...v1.1.0)

* Adds an edit view for requests. Completes UIREQ-8.
* Adds delivery location address display and selection. Completes UIREQ-24.
* Adds a user search-and-select widget to the new request form. Completes UIREQ-21.
* All resources in manifest now reference props.resources instead of props.data. Completes UIREQ-10.
* Searching and filtering now behave as specified. Completes UIREQ-11 & UIREQ-13.
* Bugs in request type selection and new request creation have been squashed. Completes UIREQ-20.
* Code cleanup and fixing of linting errors. Completes UIREQ-19.
* Enables 'search on enter' for item and requester barcode fields in create/edit form. Part of UIREQ-2, UIREQ-8.
* Adds request count to request detail view. Completes UIREQ-34.
* Fixes presentation of shelving location in create/edit view.
* Excludes closed loans from loan lookup. Completes UIREQ-27.
* Adds an 'all permissions' permission. Completes UIREQ-36.
* Adds fulfilment preference and delivery address to detail view. Completes UIREQ-39.
* Favor react-intl date/time formatters. Refs STCOR-109.
* Updates validation to use redux-form's asyncValidate approach.
* Switch out magnifying glass for "Requester look-up" link. Fixes UIREQ-47.
* Pull Row and Col from stripes-components. Refs STRIPES-490.

## [1.0.0](https://github.com/folio-org/ui-requests/tree/v1.0.0) (2017-09-26)

* Initial release of requests module, including support for search, listing search results, viewing request details, and creating new Recall requests (UIREQ-1, UIREQ-2, UIREQ-3).
