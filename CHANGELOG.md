# Change history for ui-requests

## 1.2.0 (IN PROGRESS)

* Refactor code to use <SearchAndSort> component. Completes UIREQ-49.
* Include clear-filter handlers. Refs STRIPES-495.
* rewire loan links from items to inventory. Fixes UIREQ-57.

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
