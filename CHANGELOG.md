# Change history for ui-requests

## [2.1.0] (IN PROGRESS)
* Paneheader Actions updates. Refs UIREQ-415.
* Add ability to create a request with the requester without barcode. Fixes UIREQ-444.
* Fix bug causing spurious form saves after proxy selection. Fixes UIREQ-449, UIREQ-454.
* Prevent error on duplicating request with proxy requester. Fixes UIREQ-456.
* Set correct service point default for proxy sponsors. Fixes UIREQ-455.
* Change requester background color on `Request detail` page to increase color contrast. Refs UIREQ-438. 
* Fix export to CSV. Fixes UIREQ-453.
* Restore the ability to view 'Block details' from "Patron blocked from requesting" modal. Fixes UIREQ-451.

## [2.0.1](https://github.com/folio-org/ui-requests/tree/v2.0.1) (2020-03-17)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v2.0.0...v2.0.1)

* Update to `plugin-find-user` `v2.0.0`.

## [2.0.0](https://github.com/folio-org/ui-requests/tree/v2.0.0) (2020-03-16)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.14.0...v2.0.0)

* Disable confirm button when cancel is in progress. Fixes UIREQ-321
* Blocked patron can successfully place a Request. Refs UIREQ-394.
* Fix reference to `userId` via block. Fixes UIREQ-396.
* Create/Edit a request | Move Save/Cancel buttons to the footer. Refs UIREQ-370.
* Fix bug with wrong delivery address in request form. Refs UIREQ-380.
* Fix menus displaying when duplicating request. Refs UIREQ-385.
* Fix bug in new request linking back to inventory item record. Fixes UIREQ-349.
* Fix open request count on item when creating a new request. Fixes UIREQ-343.
* Show effective call number in details pane. Refs UIREQ-366.
* Fix sorting by request date. Fixes UIREQ-399.
* Support new versions of mod-inventory and mod-circulation. Refs UIREQ-405.
* Filter Requests by Tags. Refs UIREQ-409.
* Fix sorting by proxy. Fixes UIREQ-342.
* Prevent all request types for declared lost item. Refs. UIREQ-392.
* Update unit tests to accommodate action menu changes. Refs UIREQ-418, STCOM-553.
* Fix a bug in request duplication. Fixes UIREQ-412.
* Security update eslint to v6.2.1. Refs UIREQ-407.
* Rename request export names in Action dropdown, make links disabled if no search/filtered results. Refs UIREQ-395.
* Include effective call number elements in the Request CSV. Refs UIREQ-367.
* Include effective call number elements in the Hold shelf clearance report. Refs UIREQ-368.
* Only fetch open loans when loading an item. Fixes UIREQ-353.
* Make `Export hold shelf clearance report` for `CurrentServicePoint` disabled if there is nothing on it for the currently selected service point. Fixes UIREQ-395.
* Add possibility for render all available tokens on pick slip. Fixes UICIRC-416.
* Make disabling `Export hold shelf clearance report` for `CurrentServicePoint` not depending on filter results. Fixes UIREQ-395.
* Fix link to `ui-users` from request details screen. Fixes UIREQ-424.
* Add 'Load more' button at the end of the results list. Fixes UIREQ-427.
* Display effective call number string on the request queue page. Refs UIREQ-372.
* Upgrade to `stripes` `v3.0.0`.
* Correctly handle multiple sequential 'cancel' requests. Refs UIREQ-417.
* Fix the ability to change service point for open page request. Fixes UIREQ-426.
* Fix display of the request count on item in the view and edit mode. Fixes UIREQ-433.

## [1.14.0](https://github.com/folio-org/ui-requests/tree/v1.14.0) (2019-12-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.13.0...v1.14.0)

* Add request queue page with reorder capabilities. Part of UIREQ-112.
* Display cancellation reason on cancelled request. Part of UIREQ-364.
* Add requesterId to requests query. Part of UIU-1370.
* Remove 'Request can not be moved above page request' dialog. Part of UIREQ-379.
* Provide reorder queue permission. Refs UIREQ-318.
* Show reorder view after moving request from one item to another. Refs UIREQ-334.

## [1.13.0](https://github.com/folio-org/ui-requests/tree/v1.13.0) (2019-09-23)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.12.0...v1.13.0)

* Provide move-request permission. Refs UIREQ-315.

## [1.12.0](https://github.com/folio-org/ui-requests/tree/v1.12.0) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.11.0...v1.12.0)

* Correctly preserve hold shelf expiration date. Refs UIREQ-297.
* More granular permissions. Refs UIREQ-107, UIREQ-108, UIREQ-109.
* Allow the request type to be changed when moving it. Refs UIREQ-294.
* Prevent a request from being moved above a page request. UIREQ-303.
* Add "No service point selected" modal and error handling. Refs UIREQ-317.
* Populate shelving location on request view and edit form. Fixes UIREQ-311.
* Show copy number from item record. Fixes UIREQ-313.
* Only show the 'move to second position' comfirmation dialog when appropriate. Fixes UIREQ-320.

## [1.11.0](https://github.com/folio-org/ui-requests/tree/v1.11.0) (2019-07-24)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.10.1...v1.11.0)

* Add Location Code Column to Request CSV. Refs UIREQ-263.
* Add library column to Request CSV. Refs UIREQ-262.
* Do not show proxy popup during edit. Fixes UIREQ-291.
* Move requests between items. Fixes UIREQ-269
* Hide requester's proxy section when requesting as self. Fixes UIREQ-290.

## [1.10.1](https://github.com/folio-org/ui-requests/tree/v1.10.1) (2019-06-24)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.10.0...v1.10.1)

* Refactor async validation. Part of UIREQ-280.
* Cleanup item lookup values when layer is closed. Fixes UIREQ-285 and UIREQ-287.

## [1.10.0](https://github.com/folio-org/ui-requests/tree/v1.10.0) (2019-06-12)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.9.0...v1.10.0)

* Fix creating hold request via duplicate option. Part of UIREQ-275.
* Fix opening correct request item during duplication. Part of UIREQ-274.
* Disable integration test based on flaky built-in data. Refs CIRCSTORE-129.
* Fix system error caused patron with a block. Fix UIU-1063.

## [1.9.0](https://github.com/folio-org/ui-requests/tree/v1.9.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.8.0...v1.9.0)

* Allow requests for On order and In process items. Part of UIREQ-247.
* Add ability to create a request without an item barcode. Part of UIREQ-253.

## [1.8.0](https://github.com/folio-org/ui-requests/tree/v1.8.0) (2019-03-15)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.7.0...v1.8.0)

* Update BigTest interactors to reflect MCL aria changes. Refs STRIPES-597.
* Move AppIcon import to `@folio/stripes/core`. Refs STCOM-411.
* Update integration tests to accommodate MCL aria changes. Fixes UIREQ-205.
* Update unit tests to change application from its default state. Fixes UIREQ-210.
* Update circulation OKAPI interface to v6.0. Part of UICIRC-164.
* Fix request expiration date not displaying on details view. Part of UIREQ-192.
* Fix saving empty hold shelf expiration date. Part of UIREQ-206.
* Update circulation v7.0 and request-storage v3.0 OKAPI interfaces Part of UIREQ-214.
* Extract static strings for translation. Fixes UIREQ-219.
* Reorganize fields on request record to support conditional display of fequest types. Part of UIREQ-208.
* Pre-filter request types based on whitelist. Part of UIREQ-209.
* Fix item status. Fixes UIREQ-222.
* Fix reasons when the patron has more than one block. Fix UIU-804.
* Fix UX Consistency Fixes for Patron Blocks. Ref UIU-902.

## [1.7.0](https://github.com/folio-org/ui-requests/tree/v1.7.0) (2019-01-25)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.6.0...v1.7.0)

* Upgrade to stripes v2.0.0.

## [1.6.0](https://github.com/folio-org/ui-requests/tree/v1.6.0) (2019-01-10)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.5.0...v1.6.0)

* Add ability to duplicate request record. Fixes UIREQ-166.
* Fill item barcode if itemBarcode is present in the url. Part of UIIN-410.
* Add feature enforce manual patron blocks. Ref UIU-675.
* Fix expiration date for patron blocks. Fix UIU-792.

## [1.5.0](https://github.com/folio-org/ui-requests/tree/v1.5.0) (2018-12-13)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.4.1...v1.5.0)

* Fix bug preventing item view accordions from closing. Fixes UIREQ-123.
* Fix bug causing barcode validation to misbehave. Fixes UIREQ-127.
* Refactor requests app to address UIREQ-124, UIREQ-132 and UIREQ-126.
* Show `active` column in find-user popup. Refs STCOM-385.
* Populate pickup service point with service points. Fixes UIREQ-131.
* Configure 'Requests: All permissions' permission set. Fixes UIREQ-106.
* Show No Requests By Default. Fixes UIREQ-150.
* Support `circulation` v5.0, requiring service-point information on loans. Refs UIREQ-161.
* Upgrade dependency on `inventory`. Completes UIREQ-173.
* Use documented react-intl patterns instead of stripes.intl. Completes UIREQ-135.
* Apply internationalization to all hardcoded strings. Completes UIREQ-147.
* Improve opening request record. Fixes UIREQ-134.
* Removed deprecated actionMenuItems-prop. Fixes UIREQ-170.
* Read user and item barcodes from the query string for new requests. Fixes UIREQ-146.

## [1.4.1](https://github.com/folio-org/ui-requests/tree/v1.4.1) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.4.0...v1.4.1)

* Fix `exportCsv` import

## [1.4.0](https://github.com/folio-org/ui-requests/tree/v1.4.0) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.3.0...v1.4.0)

* Link to request queue from detailed view, refs UIREQ-122
* Fix filters2cql import
* Fix bug where patron details display as "[object Object]". Fixes UIREQ-120.

## [1.3.0](https://github.com/folio-org/ui-requests/tree/v1.3.0) (2018-10-03)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v1.2.0...v1.3.0)

* Add alternate dependency `inventory` 7.0. Completes UIREQ-115
* Update `stripes-form` dependency to v1.0.0.
* Fix case-sensitive filter tests. Fixes UIREQ-119.
* Remove notes helper app
* Copy `craftLayerUrl()` from `stripes-components`
* Use `stripes` 1.0 framework

## [1.2.0](https://github.com/folio-org/ui-requests/tree/v1.2.0) (2018-09-10)
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
