# Change history for ui-requests

## IN PROGRESS

* Fix the issue when proxy pop-up and block pop-up appear at the same time for requests. Refs UIREQ-668.
* Fix the issue when `block` modal appears even if no manual blocks and vice versa. Refs UIREQ-670
* Move reusable part of `move request dialog box` to reusable component. Refs UIREQ-660.
* When newly added patron is deleted after making and canceling request, requests page is unstable. Refs UIREQ-672.
* Import `stripes-core` components via `@folio/stripes`. Refs UIREQ-609.
* Create reusable component for render title level information. Refs UIREQ-654.
* Add preferred name to Requests UI. Refs UIREQ-605.
* After the "Select item" window appears, the size of the Request information changes. Refs UIREQ-690.
* Upgrade `react-beautiful-dnd` to `v13.1.0`. Refs UIREQ-698.
* Fix big tests. Refs UIREQ-703.
* BREAKING: TLR - data migration for request list, view, create, edit, duplicate. Refs UIREQ-664.
* BREAKING: TLR - data migration for dialogboxes and reorder list. Refs UIREQ-665.
* BREAKING: TLR - data migration for hold shelf clearance report. Refs UIREQ-677.
* BREAKING: TLR - data migration, move `holdingsRecordId`. Refs UIREQ-685.
* BREAKING: TLR - depend on okapi interface `circulation` `12`. Refs UIREQ-685.
* BREAKING: TLR - depend on okapi interface `request-storage` `4.0`. Refs UIREQ-685, UIREQ-708, FOLIO-3376.
* Create title level request checkbox. Refs UIREQ-655.
* Update request results page. Refs UIREQ-614.
* Update request details pane. Refs UIREQ-613.
* Closed TLR should not be able to be duplicated when TLR is disabled. Refs UIREQ-691.
* Update form for posibility of `Title` level requests. Refs UIREQ-620.
* Unchecking the Title level request box when it is automatically checked. Refs UIREQ-633.
* Turn an item level request into a title level request. Refs UIREQ-635.
* View & reorder requests (first accordion). Refs UIREQ-630.
* View & reorder requests (second accordion). Refs UIREQ-644.
* Migrate requests queue/reorder page on new end-points. Refs UIREQ-695.
* Create new request filter. Refs UIREQ-612.
* Change render dependency for item link and information from `requestLevel` to `item`. Refs UIREQ-704.
* Fixed behavior of `hyperlinks` related to `TLR`. Refs UIREQ-702.
* Disable validation on reordering for `Page` requests for `TLR` feature. Refs UIREQ-706.
* Add all required attributes for the `position` field in request info. Refs UIREQ-707.
* The user is redirected to the `Request queue` where the request queue is not displayed. Refs UIREQ-709.
* Select item modal should display all items in the Instance when user uncheck box. Refs UIREQ-700.
* Header and Subhead do not match the given form in Request queue page. Refs UIREQ-713.
* Fulfillment in progress accordion should have position column in Request queue page. Refs UIREQ-705.
* Upgrade `circulation` to `13.0`. Refs UIREQ-717.
* Fix the issue when user is not redirected to "Item page". Refs UIREQ-714.
* Fix unnecessary add of the `numberOfNotYetFilledRequests` field to the request data. Refs UIREQ-726.
* Make translation keys more specific. Refs UIREQ-715.
* Fulfillment Preference field not respecting user fulfillment preferences in edit mode. Refs UIREQ-658.
* Fix `view requests in queue` link behaviour. Refs UIREQ-727.
* Add link for `Requests on item` field if level of request is `Title`. Refs UIREQ-730.
* Add `circulation.requests.queue.collection.get` permission. Refs UIREQ-734.
* When scrolling, a white background appears and the blue focus indicator is cut off. Refs UIREQ-733.
* The item requested is duplicated in the queue. Refs UIREQ-737.

## [6.0.0](https://github.com/folio-org/ui-requests/tree/v6.0.0) (2021-10-05)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v5.1.0...v6.0.0)

* Localize `Barcode`. Refs UIREQ-220.
* Fix proxy bug in request duplication. Fixes UIREQ-626.
* Include `request-preferences` permission in edit and create psets. Refs UIREQ-628.
* Omit request-cancellation details in duplicated requests. Refs UIREQ-627.
* Disable hold shelf clearance report button when a request for `hold-shelf-clearance` data is pending. Fixes UIREQ-629.
* Increment stripes to v7, react to v17. Refs UIREQ-634.

## [5.1.0](https://github.com/folio-org/ui-requests/tree/v5.1.0) (2021-06-17)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v5.0.0...v5.1.0)

* Choose correct service point when patron is changed in duplicate mode. Fixes UIREQ-595.
* Increase limit for tags request to 10k. Refs UIREQ-596.
* Also support `circulation` `10.0`. Refs UIREQ-600.
* Change request type when changing to an item with different status. Fixes URIEQ-597.
* Manual patron block modal is not shown. Refs UIREQ-601.
* Provide search by ISBN. Refs UIREQ-354.
* Avoid console errors related to bad proptypes. Refs UIREQ-604.
* Consume some i18n components via stripes proxies to avoid Safari bugs. Refs UIREQ-528.
* Validate items by barcode with an efficient exact-match query. Fixes UIREQ-602.
* Also support `circulation` `11.0`. Refs UIREQ-608.

## [5.0.0](https://github.com/folio-org/ui-requests/tree/v5.0.0) (2021-03-18)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.6...v5.0.0)

* Add timepicker for hold shelf expiration date. Refs UIREQ-381.
* Omit `holdShelfExpirationDate` field in duplicated request. Refs UIREQ-532.
* Fix sorting by request status. Fixes UIREQ-540.
* Fix search by tags. Fixes UIREQ-542.
* Fix CSV search results export. Fixes UIREQ-539.
* Fix default pickup service point when editing existing request. Fixes UIREQ-544.
* Increase the limit to display all items in the `Move request` modal. Fixes UIREQ-541.
* Fix the non-responsive design of the `Move request` modal. Fixes UIREQ-552.
* Add a 'working' indicator for CSV search results export. Fixes UIREQ-555.
* Add a toast notification for CSV search results export. Refs UIREQ-555.
* Increase the limit to display correct number of requests in the `Move request` modal. Fixes UIREQ-566.
* Allow for duplicating a closed request. Fixes UIREQ-553.
* Retrieve requests to items in chunks. Fixes UIREQ-558.
* Add `Patron comments` field to request. Refs UIREQ-530.
* Fix fulfillment misspelling. Fixes UIREQ-567.
* Add `Patron comments` field to search results CSV export and expired holds report. Refs UIREQ-549, UIREQ-550.
* Show `lastCheckedInDateTime` token for staff slips in locale format and date/time. Refs UIREQ-495.
* Barcode image not rendering on print slips. Refs UIREQ-570.
* Patron block modal for Requesting should display up to 3 blocks, with Automated Patron Blocks on top of Manual Patron Blocks. Refs UIREQ-496.
* Fix duplicating request when item is changed. Fixes UIREQ-572.
* Replace withRef with forwardRef. Refs STRIPES-721.
* Add `Patron comments` to staff slip options. Refs UICIRC-523.
* Prevent all request types for items with intellectual item, in process (non-requestable), long missing, unavailable, and unknown statuses. Refs UIREQ-393.
* Increment `@folio/stripes-cli` to `v2`. Refs UIREQ-578.
* Display l10n'ed values for type, status in results pane. Refs UIREQ-580.
* Override patron blocks of requesting when user has credentials. Refs UIREQ-576.
* Fix canceled request display in `Hold shelf clearance report`. Fixes UIREQ-543.
* Allow requests for Restricted items. Refs UIREQ-581.
* Previous patron block remembered on new request. Refs UIREQ-586.
* Fix display of the content of error modal. Fix UIREQ-587.
* Use `react-intl` `v5` compatible version of `react-intl-safe-html`.
* Use `@folio/stripes` `v6` compatible version of `@folio/plugin-find-user`.

## [4.0.6](https://github.com/folio-org/ui-requests/tree/v4.0.6) (2021-01-25)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.5...v4.0.6)

* Barcode image not rendering on print slips. Refs UIREQ-570.

## [4.0.5](https://github.com/folio-org/ui-requests/tree/v4.0.5) (2020-11-30)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.4...v4.0.5)

* Increase the limit to display correct number of requests in the `Move request` modal. Fixes UIREQ-566.

## [4.0.4](https://github.com/folio-org/ui-requests/tree/v4.0.4) (2020-11-20)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.3...v4.0.4)

* Increment `@folio/stripes` to `^5.0.7`. Refs STFORM-16.
* Add a toast notification for CSV search results export. Refs UIREQ-555.

## [4.0.3](https://github.com/folio-org/ui-requests/tree/v4.0.3) (2020-11-16)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.2...v4.0.3)

* Add a 'working' indicator for CSV search results export. Fixes UIREQ-555.

## [4.0.2](https://github.com/folio-org/ui-requests/tree/v4.0.2) (2020-11-12)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.1...v4.0.2)

* Fix sorting by request status. Fixes UIREQ-540.
* Omit `holdShelfExpirationDate` field in duplicated request. Refs UIREQ-532.
* Fix search by tags. Fixes UIREQ-542.
* Avoid phantom block modal after clearing blocks. Refs UIREQ-545.
* Fix default pickup service point when editing existing request. Fixes UIREQ-544.
* Increase the limit to display all items in the `Move request` modal. Fixes UIREQ-541.
* Fix the non-responsive design of the `Move request` modal. Fixes UIREQ-552.

## [4.0.1](https://github.com/folio-org/ui-requests/tree/v4.0.1) (2020-10-15)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v4.0.0...v4.0.1)

* Update plugins to `stripes v5`-compatible versions. Refs UIREQ-535.

## [4.0.0](https://github.com/folio-org/ui-requests/tree/v4.0.0) (2020-10-14)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v3.0.1...v4.0.0)

* Reword error message when user does not select patron barcode.  Addresses UIREQ-514.
* Fix bug that require user hit Enter in item field before save the request. Fixes UIREQ-326.
* Add staff notes accordion to request details page. Refs UIREQ-457.
* Request staff notes: Assign/Unassign Notes. Refs UIREQ-458.
* Add staff notes view details page. Refs UIREQ-459.
* Use `==` for more efficient queries. Refs PERF-62.
* Use `==` for requestType and status filters. Refs CIRC-817.
* Improve loading requester details. Refs UIREQ-477.
* Add subpermission to `Requests: View, create`. Refs UIREQ-486.
* Increment `@folio/stripes` to `v5` for `react-router` `v5.2`.
* Fix the ability to sort by the `Request Date` column. Fixes UIREQ-481.
* Request staff notes: View assigned notes. Refs UIREQ-467.
* Include tag-related permissions in `ui-users.edit` permission. Refs UITAG-29.
* Request staff notes: Edit note details. Refs UIREQ-460.
* Use item id instead of barcode for links on request details screen. Fixes UIREQ-484.
* Refactor to `miragejs` from `@bigtest/mirage`.
* Add loading indicator when service point is switched. Fixes UIREQ-508.
* Use patron group name ('group') instead of description in displays. Fixes UIREQ-499.
* Improve performance issues with preview for print pick slips. Fixes UIREQ-507.
* Add feedback after print button is clicked. Fixes UIREQ-508.
* Escape values passed to `react-to-print`. Fixes UIREQ-510.
* Block requests for Aged to lost items. Refs UIREQ-429.
* Create filter for Requests - Pickup service point. Refs UIREQ-516.
* Use MultiColumnList columnwidths API to shrink column widths - Fixes UIREQ-521.
* Implement easy way to copy Barcode in the Request record. Refs UIREQ-478.
* Switch service point filter from checkboxes to multi-select picker. Refs UIREQ-527.
* Add Request Date to the Request CSV report. Refs UIREQ-531.

## [3.0.1](https://github.com/folio-org/ui-requests/tree/v3.0.1) (2020-06-19)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v3.0.0...v3.0.1)

* Increment `@folio/plugin-find-user` to `v3.0` for `@folio/stripes` `v4` compatibility.

## [3.0.0](https://github.com/folio-org/ui-requests/tree/v3.0.0) (2020-06-15)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v2.0.1...v3.0.0)

* Paneheader Actions updates. Refs UIREQ-415.
* Add ability to create a request with the requester without barcode. Fixes UIREQ-444.
* Fix bug causing spurious form saves after proxy selection. Fixes UIREQ-449, UIREQ-454.
* Prevent error on duplicating request with proxy requester. Fixes UIREQ-456.
* Set correct service point default for proxy sponsors. Fixes UIREQ-455.
* Change requester background color on `Request detail` page to increase color contrast. Refs UIREQ-438.
* Fix export to CSV. Fixes UIREQ-453.
* Restore the ability to view 'Block details' from "Patron blocked from requesting" modal. Fixes UIREQ-451.
* Purge `intlShape` in prep for `react-intl` `v4` migration. Refs STRIPES-672.
* Prevent requests on for items with the status Withdrawn. Refs UIREQ-390.
* Prevent requests on for items with the status Claimed returned. Refs UIREQ-391.
* Prevent requests for items with the status Lost and paid. Refs UIREQ-400.
* Upgrade to `stripes` `4.0`, `react-intl` `4.5`. Refs STRIPES-672.
* Fixed label in move hold modal to show item title.  Fixes UIREQ-304.
* Patron Blocks: Is there an automated patron block on requesting? Refs UIREQ-471.
* Make permission names l10nable. Refs UIREQ-474.

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
