# Change history for ui-requests

## 13.0.0 IN PROGRESS

* Display Anonymized when viewing a requester/proxy for a single anonymized loan. Refs UIREQ-1313.
* *BREAKING* Use `convertToSlipData` and supporting functions from `stripes-util`. Refs UIREQ-1263.
* Replace moment with day.js. Refs UIREQ-1291.
* Reduce count of eslint errors after update eslint-config-stripes. Refs UIREQ-1289.
* Display loan type and "For use at location" loan-policy setting in new-request form. Fixes UIREQ-1282.
* Display Unknown user instead of link with undefined when a user record is deleted. Refs UIREQ-1312.
* Add default value for `record` parameter when it is missing in `getFullNameForCsvRecords`. Add `getPrintedDetails` to display only the date in a CSV file when the user was deleted. Fixes UIREQ-1305.
* Add missing subPermissions for "Requests: View, create" permission. Refs UIREQ-1296.
* Display loan type on the Request Detail page, as well as New Request page. Refs UIREQ-1328.
* When creating or viewing a request, show whether the a loan on the item would be use-at-location. Fixes UIREQ-1327.
* Added global permissions for get read-access to values such as tenant’s locale, timezone, and currency. Refs UIREQ-1341.

## [12.0.4] (https://github.com/folio-org/ui-requests/tree/v12.0.4) (2025-10-29)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v12.0.3...v12.0.4)

* Use the `type` field to determine a DCB user. Show a loading indicator while full request details are being loaded, the `type` field will only be available after loading. Refs UIREQ-1338.

## [12.0.3] (https://github.com/folio-org/ui-requests/tree/v12.0.3) (2025-05-28)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v12.0.2...v12.0.3)

* Remove barcode hyperlink from the Central tenant request Item information section. Refs UIREQ-1306.

## [12.0.2] (https://github.com/folio-org/ui-requests/tree/v12.0.2) (2025-04-15)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v12.0.1...v12.0.2)

* [Retrieval SP filter] Move related code to make the filter enabled for ecs/non-ecs UI. Refs UIREQ-1294.

## [12.0.1] (https://github.com/folio-org/ui-requests/tree/v12.0.1) (2025-03-21)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v12.0.0...v12.0.1)

* Fix issue when creating a request with an item that does not have a barcode. Refs UIREQ-1275.

## [12.0.0] (https://github.com/folio-org/ui-requests/tree/v12.0.0) (2025-03-14)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.6...v12.0.0)

* Increase code coverage for src/ChooseRequestTypeDialog.js by Jest/RTL tests. Refs UIREQ-1044.
* Increase code coverage for src/ViewRequest.js by Jest/RTL tests. Refs UIREQ-1046.
* React v19: refactor away from default props for functional components. Refs UIREQ-1101.
* Add icons to requests action menu. Refs UIREQ-1116.
* Revise "Enter" button on New request page. Refs UIREQ-1114.
* Change import of `exportToCsv` from `stripes-util` to `stripes-components`. Refs UIREQ-1138.
* Fix accessibility issues with requests list. Refs UIREQ-1231.
* *BREAKING* Update `react-intl` to `^7`. Refs UIREQ-1259.
* Migrate to shared GA workflows. Refs UIREQ-1257.
* *BREAKING* Update stripes-* dependencies to latest version. Refs UIREQ-1258.
* Support new item tokens for printing pick slips, search slips, etc. Fixes UIREQ-1267.
* Make focus indicator visible for instance name on the Requests Queue page. Refs UIREQ-1215.
* Use NoValue component for absent information. Refs UIREQ-1262.
* Add optionalOkapiInterfaces `circulation-bff-loans` `1.0`. Refs UIREQ-1273.
* For consistency searching use == instead of = for requester barcode. Refs UIREQ-640.
* Add missed sub-permissions for "Requests: View" permission. Refs UIREQ-1217.

## [11.0.9] (https://github.com/folio-org/ui-requests/tree/v11.0.9) (2025-05-21)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.8...v11.0.9)

* Remove barcode hyperlink from the Central tenant request Item information section. Refs UIREQ-1306.

## [11.0.8] (https://github.com/folio-org/ui-requests/tree/v11.0.8) (2025-04-30)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.7...v11.0.8)

* Requests export to CSV does not work for Hold TLR. Refs UIREQ-1292.

## [11.0.7] (https://github.com/folio-org/ui-requests/tree/v11.0.7) (2025-04-14)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.6...v11.0.7)

* Fix issue when creating a request with an item that does not have a barcode. Refs UIREQ-1298.

## [11.0.6] (https://github.com/folio-org/ui-requests/tree/v11.0.6) (2025-03-07)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.5...v11.0.6)

* Filter request print tracking data for duplicates. Refs UIREQ-1261.
* Requests App - Export Requests app search results list (csv) - Add Request UUID. Refs UIREQ-1264.

## [11.0.5] (https://github.com/folio-org/ui-requests/tree/v11.0.5) (2025-02-28)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.4...v11.0.5)

* Hide edit, cancel, move and duplicate buttons for intermediate requests in central tenant. Refs UIREQ-1254.

## [11.0.4] (https://github.com/folio-org/ui-requests/tree/v11.0.4) (2025-02-07)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.3...v11.0.4)

* Add `requests ID` as a search parameter for search box. Refs UIREQ-1232.

## [11.0.3] (https://github.com/folio-org/ui-requests/tree/v11.0.3) (2025-01-10)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.2...v11.0.3)

* Add optional column "Retrieval service point" to requests search list. Refs UIREQ-1188.
* Add Sorting and pagination for "Retrieval service point" column. Refs UIREQ-1189.
* Add "Retrieval service point" filter. Refs UIREQ-1190.
* Include `Retrieval service point` column in csv exports. Refs UIREQ-1191.
* Cleanup retrieval service point implementation from deprecated folder. Refs UIREQ-1211.

## [11.0.2] (https://github.com/folio-org/ui-requests/tree/v11.0.2) (2024-12-10)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.1...v11.0.2)

* Migrate from `mod-circulation` to `mod-circulation-bff` for `Print pick slips` and `Print search slips`. Refs UIREQ-1154.

## [11.0.1] (https://github.com/folio-org/ui-requests/tree/v11.0.1) (2024-12-02)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v11.0.0...v11.0.1)

* Remove "circulation-bff-requests" okapi interface. Refs UIREQ-1203.

## [11.0.0] (https://github.com/folio-org/ui-requests/tree/v11.0.0) (2024-11-30)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v10.0.2...v11.0.0)

* Consistency update permission after change them in mod-circulation. Refs UIREQ-1194.
* Use settings/entries endpoint to get settings information. Refs UIREQ-1062.
* Requests app.: Editing requests (ECS with mod-tlr enabled). Refs UIREQ-1088.
* Requests app.: Cancelling request (ECS with mod-tlr enabled). Refs UIREQ-1090.
* Requests app.: Reorder request queue (ECS with mod-tlr enabled). Refs UIREQ-1098.
* Requests app.: Moving request (ECS with mod-tlr enabled). Refs UIREQ-1100.
* Hide Action menu on secondary requests (ECS + mod-tlr). Refs UIREQ-1105.
* *BREAKING* Use `circulation/items-by-instance` endpoint to get item and instance information. Refs UIREQ-1091.
* Hide Duplicate and Move action buttons in ECS env with mod-tlr enabled. Refs UIREQ-1127, UIREQ-1125.
* Update permissions set to be able to get item/instance information. Refs UIREQ-1148.
* *BREAKING* Migrate to new endpoints to get request types and to create a new request. Refs UIREQ-1113.
* Use `instanceId` param for ILR from items response. Refs UIREQ-1149.
* Send `holdingsRecordId` param for Item level requests. Refs UIREQ-1167.
* Add `tlr.settings.get` permission. Refs UIREQ-1169.
* Add `mod-settings.global.read.circulation` permission. Refs UIREQ-1170.
* Add `mod-settings.entries.collection.get` permission. Refs UIREQ-1177.
* *BREAKING* Migrate to new `mod-circulation-bff` endpoints. Refs UIREQ-1134.
* Implement feature toggle for ECS and not ECS envs. Refs UIREQ-1171.
* Hide proxy functionality for ECS with mod-tlr enabled. Refs UIREQ-1185.
* Update permission after mod-patron-blocks permission changes. Refs UIREQ-1201.

## [10.0.2] (https://github.com/folio-org/ui-requests/tree/v10.0.2) (2024-11-22)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v10.0.1...v10.0.2)
* Update permission checks of ui-users. Refs UIREQ-1187.

## [10.0.1] (https://github.com/folio-org/ui-requests/tree/v10.0.1) (2024-11-13)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v10.0.0...v10.0.1)

* Fix DOMPurify import. Refs UIREQ-1180.

## [10.0.0] (https://github.com/folio-org/ui-requests/tree/v10.0.0) (2024-10-31)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.1.2...v10.0.0)

* Use Save & close button label stripes-component translation key. Refs UIREQ-1073.
* Include single print and selection print options on results list and actions menu. Refs UIREQ-966.
* Set up default pickup service point if it is available. Refs UIREQ-1095.
* Fix Request detail pane capitalization. Refs UIREQ-1106.
* Update the column labels. Refs UIREQ-1104.
* Add "Printed" and "# Copies" columns in "Show Columns" list and Request records table. Refs UIREQ-1118.
* Update printing details on printing pick slips. Refs UIREQ-1122.
* Populate the token 'request.barcodeImage' in the pick slip. Refs UIREQ-1117.
* Populate the token "staffUsername" in the pick slip. Refs UIREQ-1124.
* Implement availability of "Printed" and "# Copies" columns upon "Enable view print details (Pick slips)" configuration. Refs UIREQ-1121.
* Implement availability of "Print status" filters upon "Enable view print details (Pick slips)" configuration. Refs UIREQ-1119.
* Add missing sub-permissions to fetch staff slips records. Refs UIREQ-1129.
* Add missing sub-permissions to fetch "pick-slips" and "search-slips" records in "Requests: View, edit, cancel" permission. Refs UIREQ-1137.
* Optimize performance of the "print-events-entry" API to reduce slowness during the initial call. Refs UIREQ-1130.
* Revert Custom "Print Status" filter code implementation. Refs UIREQ-1146.
* Add sorting to 'Printed' and '# Copies' columns in the Request App. Refs UIREQ-1140.
* Implement "Print Status" filters as server-side filters. Refs UIREQ-1147.
* Navigate to first page when saving the pick slip print log from beyond the first page. Refs UIREQ-1145.
* Also support okapiInterfaces `inventory` `14.0`. Refs UIREQ-1160.
* Review and cleanup Module Descriptor. Refs UIREQ-1156.
* *BREAKING* Update `ui-plugin-find-instances` to version `8.0.0`. Refs UIREQ-1172.

## [9.1.2] (https://github.com/folio-org/ui-requests/tree/v9.1.2) (2024-09-13)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.1.1...v9.1.2)

* Remove bigtests from github actions. Refs UIREQ-1099.
* Fix issue with Proxy's patron group and delivery address that shown instead of Sponsor's when creating request. Refs UIREQ-1132, UIREQ-1133.
* Update upload-artifact actions from v1 and v2 to v4. Refs UIREQ-1150.

## [9.1.1] (https://github.com/folio-org/ui-requests/tree/v9.1.1) (2024-03-27)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.1.0...v9.1.1)

* Add support for Barcode tag with sanitize. Refs UIREQ-1080, UIREQ-1082.

## [9.1.0](https://github.com/folio-org/ui-requests/tree/v9.1.0) (2024-03-22)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.0.2...v9.1.0)

* Hide all actions except "Cancel Request" in Action menu (Lending library). Refs UIREQ-1032.
* Hide all actions except "Cancel Request" in Action menu and DCB item links (Borrowing library). Refs UIREQ-1034.
* Hide all actions except "Cancel Request" in Action menu and DCB item links (Pickup library). Refs UIREQ-1035.
* Request Action - Create new option Print search slips. Refs UIREQ-1039.
* Hide Actions menu on closed request of DCB Transaction. Refs UIREQ-1040.
* Update Jest/RTL tests, remove outdated imports. Refs UIREQ-996.
* Add support for `search-slips` okapi interface version `0.1`. Refs UIREQ-1042.
* Increase code coverage for src/RequestForm.js by Jest/RTL tests. Refs UIREQ-1043.
* Add functionality to handle page title on the requests list page. Refs UIREQ-1058.
* Error in Export Hold Shelf Clearance Report. Refs UIREQ-1057.
* Make updating of TLR settings when settings config is changed. Refs UIREQ-1063.
* Increase code coverage for src/components/RequestsFilters/RequestsFilters.js by Jest/RTL tests. Refs UIREQ-1051.
* Use `getFullName` for requester. Refs UIREQ-1064.
* Increase code coverage for src/RequestFormContainer.js by Jest/RTL tests. Refs UIREQ-1045.
* Increase code coverage for src/index.js by Jest/RTL tests. Refs UIREQ-1047.
* Add displaySummary field for Requests csv export. Refs UIREQ-1068.
* Add support for displaySummary token for Staff Slips. Refs UIREQ-1067.
* Only certain HTML tags should be rendered when displaying staff slips. Refs UIREQ-1080.

## [9.0.3](https://github.com/folio-org/ui-requests/tree/v9.0.3) (2024-03-27)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.0.2...v9.0.3)

* Add support for Barcode tag with sanitize. Refs UIREQ-1080, UIREQ-1082.

## [9.0.2](https://github.com/folio-org/ui-requests/tree/v9.0.2) (2024-03-22)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.0.1...v9.0.2)

* Only certain HTML tags should be rendered when displaying staff slips. Refs UIREQ-1080, UIREQ-1082.


## [9.0.1](https://github.com/folio-org/ui-requests/tree/v9.0.1) (2023-12-04)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v9.0.0...v9.0.1)

* Add support for missing request error code. Refs UIREQ-1050.

## [9.0.0](https://github.com/folio-org/ui-requests/tree/v9.0.0) (2023-10-12)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v8.0.2...v9.0.0)

* Made code improvements related to TLR. Refs UIREQ-871.
* UI tests replacement with RTL/Jest for urls. Refs UIREQ-896.
* Reassign limit variable from hardcoded value to MAX_RECORDS constant for `ItemsDialog.js`. Refs UIREQ-913.
* Reassign limit variable from hardcoded value to MAX_RECORDS constant for `RequestsRoute.js`. Refs UIREQ-914.
* Include pickup service point in display of result list. Refs UIREQ-900.
* Include "Effective call number string" in display of result list. Refs UIREQ-898.
* Include call number in Action menu list of fields to display. Refs UIREQ-899.
* Include pickup service point in Action menu list of fields to display. Refs UIREQ-901.
* Use == instead of = for loans and requests search by status. Refs UIREQ-915.
* Populate the token "requester.departments" in the pick slip, with the data provided by the backend in the ui-requests module. Refs UIREQ-814.
* UI tests replacement with RTL/Jest for src/PositionLink.js. Refs UIREQ-879.
* Populate the token "currentDateTime" in the pick slip, with the data provided by the backend in the ui-requests module. Refs UIREQ-807.
* Requests for Items on Instances with more than 10 holdings do not allow a user to move a request to all requestable items. Refs UIREQ-929.
* Split RequestForm component into three smaller parts. Refs UIREQ-836.
* Cannot save item request from item with status On Order, because need a barcode. Refs UIREQ-924.
* Cover `src/components/PrintButton/PrintButton.js` file by RTL/Jest tests. Refs UIREQ-886.
* Cover `src/components/Loading/Loading.js` file by RTL/Jest tests. Refs UIREQ-885.
* Create Jest/RTL test for ReferredRecord.js. Refs UIREQ-936.
* Create Jest/RTL test for NoteCreateRoute.js. Refs: UIREQ-943.
* Leverage cookie-based authentication in all API requests. Refs UIREQ-861.
* Create Jest/RTL test for NoteEditRoute.js. Refs UIREQ-944.
* Update `circulation` okapi interface to `14.0` version. Refs UIREQ-954.
* Added requestDate token. Refs UIREQ-962.
* Update `request-storage` okapi interface to `6.0` version. Refs UIREQ-963.
* UI tests replacement with RTL/Jest for src/PatronBlockModal.js. Refs UIREQ-878.
* Create Jest/RTL test for RequestsFiltersConfig.js. Refs UIREQ-938.
* Create Jest/RTL test for SortableList.js. Refs UIREQ-941.
* Create Jest/RTL test for draggableRowFormatter.js. Refs UIREQ-942.
* UI tests replacement with RTL/Jest for src/UserDetail.js. Refs UIREQ-881.
* TLR: "Create title level request" checkbox not preselected on "New request" page. Refs UIREQ-955.
* Do not publish test artifacts to NPM. Refs STRIPES-865.
* Create Jest/RTL test for NoteViewRoute.js. Refs UIREQ-945.
* Cover ItemInformation by jest/RTL tests. Refs UIREQ-949.
* Cover InstanceInformation by jest/RTL tests. Refs UIREQ-950.
* Fix inconsistency in RTL/Jest tests. Refs UIREQ-979.
* Create Jest/RTL test for RequestsRoute.js. Refs UIREQ-947.
* Remove redundant ariaLabel prop. Refs UIREQ-972.
* TLRs check circulation rules before request is placed. Refs UIREQ-960.
* Create Jest/RTL test for CancelRequestDialog.js. Refs UIREQ-876.
* Preparation for Enable Request Policy to Determine Allowed Pickup Service Points. Refs UIREQ-978.
* Create JEST/RTL test cases for LoadingButton.js. Refs UIREQ-933.
* Create Jest/RTL test for RequestQueueView.js. Refs UIREQ-948.
* Create Jest/RTL test for RequestQueueRoute.js. Refs UIREQ-946.
* Create Jest/RTL test for PickupServicePointFilter.js. Refs UIREQ-939.
* Jest/RTL tests cleanup. Refs UIREQ-988.
* Jest/RTL tests cleanup of RequestsRoute.js file. Refs UIREQ-991.
* Cover RequestInformation by jest/RTL tests. Refs UIREQ-951.
* Create Jest/RTL test for PrintContent.js. Refs UIREQ-935.
* UI tests replacement with RTL/Jest for src/MoveRequestManager.js. Refs UIREQ-877.
* Increase code coverage for Jest/RTL tests. Refs UIREQ-995.
* Convert primary search results view to use Prev/Next pagination. Refs UIREQ-965.
* Remove bigtest tests and associated dependencies. Refs UIREQ-999.
* Update Node.js to v18 in GitHub Actions. Refs UIREQ-1000.
* Implementation of receiving available request types. Refs UIREQ-971.
* Ensure Only Available Service Points Display When Placing a New Request. Refs UIREQ-977.
* *BREAKING* Upgrade React to v18. Refs UIREQ-998.
* Create Jest/RTL test for DraggableRow.js. Refs UIREQ-940.
* Create Jest/RTL test for ComponentToPrint.js. Refs UIREQ-931.
* Correctly escape CQL special characters in tag API queries. Refs UIREQ-918.
* Add new pickup service point error. Refs UIREQ-981.
* Move request popup show available Request Types. Refs UIREQ-1005.
* Cover RequesterInformation by jest/RTL tests. Refs UIREQ-952.
* Prefer `@folio/stripes` exports to private paths when importing components. Refs UIREQ-1020.
* Add `One or more Pickup locations are no longer available` error. Refs UIREQ-1022.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UIREQ-1025.
* Rename modal window for select request type. Refs UIREQ-1026.
* Create request from user without barcode. Refs UIREQ-1023.
* Create Jest/RTL for src/UserForm.js. Refs UIREQ-882.
* Hit Enter or Search should move focus to the Results List pane header. Refs UIREQ-564.
* Add "operation" parameter to "allowed-service-points" endpoint. Refs UIREQ-1028.
* Fix issues with skipped tests. Refs UIREQ-1024.
* Create Jest/RTL test for RequestsFilters.js. Refs UIREQ-937.
* Add "itemId" parameter to "allowed-service-points" endpoint. Refs UIREQ-1030.
* Use current optional dependencies. Refs UIREQ-1031.
* Update Requests error messages. Refs UIREQ-1036.
* Replace using of error.message with enum values for translation keys. Refs UIREQ-789.
* Update `circulation` interface version to `14.2`. Refs UIREQ-1038.

## [8.0.2](https://github.com/folio-org/ui-requests/tree/v8.0.2) (2023-03-29)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v8.0.1...v8.0.2)

* TLR: After editing a request, connection between request and item is no longer visible. Refs UIREQ-920.

## [8.0.1](https://github.com/folio-org/ui-requests/tree/v8.0.1) (2023-03-24)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v8.0.0...v8.0.1)

* Fix error with proxyUserId when it is not cleared. Refs UIREQ-919.
* Fix incorrect formatting of request date. Refs UIREQ-922.

## [8.0.0](https://github.com/folio-org/ui-requests/tree/v8.0.0) (2023-02-22)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.2.4...v8.0.0)

* Increased the limit for Service points in Request. Refs UIREQ-850.
* Cannot search for requests with tags ( or [. Fix UIREQ-846.
* BREAKING: Change "request-storage" interface version to 5.0. Refs - UIREQ-863.
* Populate the token "requester.preferredFirstName" in the pick slip, with the data provided by the backend in the ui-requests module. Refs - UIREQ-809.
* Correctly handle move-request in non-English locales. Refs UIREQ-870.
* Bump major versions of several @folio/stripes-* packages. Refs UIREQ-874.
* Populate the token "requester.patronGroup" in the pick slip, with the data provided by the backend in the ui-requests module. Refs - UIREQ-804.
* Support `inventory` `13.0` interface version. Refs UIREQ-867.
* Move and upgrade `babel-plugin-module-resolver` to dev-deps, v5. Refs UIREQ-897.
* UI tests replacement with RTL/Jest for ErrorModal. Refs UIREQ-883.
* Change filtering by tag rules in `RequestsFiltersConfig`. Refs UIREQ-904.
* Use camel case notation for all data-testid. Refs UIREQ-906.

## [7.2.4](https://github.com/folio-org/ui-requests/tree/v7.2.4) (2022-11-30)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.2.3...v7.2.4)
* Add the possibility to submit a request if there is no user barcode. Refs UIREQ-849.

## [7.2.3](https://github.com/folio-org/ui-requests/tree/v7.2.3) (2022-11-29)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.2.2...v7.2.3)
* Make title info loading when request created from Instance record at the first time. Refs UIREQ-834.

## [7.2.2](https://github.com/folio-org/ui-requests/tree/v7.2.2) (2022-11-21)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.2.1...v7.2.2)
* Make Fulfillment preference and Delivery address selectable. Refs UIREQ-837.
* Add the possibility to save item request if there is no item barcode. Refs UIREQ-840.

## [7.2.1](https://github.com/folio-org/ui-requests/tree/v7.2.1) (2022-11-14)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.2.0...v7.2.1)
* Prevent request to get instance if there is no `instanceId`. Refs UIREQ-826.
* Prevent reset of request type, fix validation issues. Refs UIREQ-824.

## [7.2.0](https://github.com/folio-org/ui-requests/tree/v7.2.0) (2022-10-20)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.1.3...v7.2.0)

* Fix modal loop when move item on request fails due to policy. Refs UIREQ-662.
* Correctly import components from `@folio/stripes/*` packages. Refs UIREQ-792.
* Render search results as normal and show dash for empty status. Refs UIREQ-818.
* Support inventory 12.0 in okapiInterfaces. Refs UIREQ-819.
* Refactor forms to use final-form. Refs UIREQ-419.
* Requests: Implement App context menu and keyboard shortcuts modal. refs UIREQ-817.
* Make title level request box selected when duplicating title level request. Refs UIREQ-827.

## [7.1.3](https://github.com/folio-org/ui-requests/tree/v7.1.3) (2022-08-11)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.1.2...v7.1.3)

* Allow user to choose request type (page, hold, recall) when placing request. Refs UIREQ-815.

## [7.1.2](https://github.com/folio-org/ui-requests/tree/v7.1.2) (2022-07-27)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.1.1...v7.1.2)

* Add title to modal message for non requested status. Refs UIREQ-797.

## [7.1.1](https://github.com/folio-org/ui-requests/tree/v7.1.1) (2022-07-20)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.1.0...v7.1.1)

* Сannot add tags to record in the Requests app. Refs UIREQ-794.
* Retrieve up to `MAX_RECORDS` cancellation-reasons. Refs UIREQ-795.

## [7.1.0](https://github.com/folio-org/ui-requests/tree/v7.1.0) (2022-06-29)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.0.2...v7.1.0)

* Add id for Pane component. Refs UIREQ-742.
* Add pull request template. Refs UIREQ-746.
* Replace `SafeHTMLMessage` with `FormattedMessage`. Refs UIREQ-610.
* Move page requests to first accordion of unified queue when reordering. Refs UIREQ-728.
* Add title look-up to new request form. Refs UIREQ-675.
* Add success toast to Requests. Refs UIREQ-722.
* Add success toast to duplicated Requests. Refs UIREQ-747.
* Fix defect with first name of success toast to Requests. Refs UIREQ-753.
* Ensure Request details # (# requests) shows correct data. Refs UIREQ-757.
* Notes Accordion is Not Closed After Deleting a Note. Refs UIREQ-759.
* Implement baseline shortcut keys. Refs UIREQ-588.
* Fix the issue when user can't select request type when item have status 'Restricted'. Refs UIREQ-772.
* Sort queue-position numerically. Refs UIREQ-750.
* Remove react-hot-loader. Refs UIREQ-758.
* Add Move request to Action list when item is attached to title level request for fulfillment. Refs UIREQ-767.
* Localize enumeration values. Refs UIREQ-624.
* Replace babel-eslint with @babel/eslint-parser. Refs UIREQ-770.
* Update NodeJS to v16 in GitHub Actions. Refs UIREQ-780.
* Fix HTTP request duplication when making request. Refs UIREQ-779.
* Disable request detail action menu when hardcoded UID is present. Refs UIREQ-783.
* Disable item and instance links in request detail when hardcoded UID is present. Refs UIREQ-784.
* Fix "Timeout of 2000ms exceeded. For async tests and hooks, ensure “done()” is called" big tests errors. Refs UIREQ-785.
* Fix big tests errors related to interactors small default timeout. Refs UIREQ-786.
* Create/Edit Request: required is not read. Refs UIREQ-775.
* Filter the items list on "move request" action from items with non-requestable statuses. Refs UIREQ-787.
* Fix validation issue of item barcode field. Refs UIREQ-694.
* Deleting already-deleted request causes ungraceful error. Refs UIREQ-344.
* Fix the number of title-level requests. Refs UIREQ-790.
* Fix problem with double call of end-point for hold shelf report. Refs UIREQ-778.

## [7.0.3](https://github.com/folio-org/ui-requests/tree/v7.0.3) (2022-08-02)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.0.2...v7.0.3)

* Retrieve up to `MAX_RECORDS` cancellation-reasons. Refs UIREQ-795.
* Fix big tests errors related to interactors small default timeout. Refs UIREQ-786.
* Fix "Timeout of 2000ms exceeded. For async tests and hooks, ensure “done()” is called" big tests errors. Refs UIREQ-785.

## [7.0.2](https://github.com/folio-org/ui-requests/tree/v7.0.2) (2022-04-04)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.0.1...v7.0.2)

* Change queue position message from "items" to "requests". Refs UIREQ-755.

## [7.0.1](https://github.com/folio-org/ui-requests/tree/v7.0.1) (2022-03-31)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v7.0.0...v7.0.1)

* Request details `# items` showing incorrect number. Refs UIREQ-754.
* Use all "open" filters for "view requests in queue" link. Refs UIREQ-756.

## [7.0.0](https://github.com/folio-org/ui-requests/tree/v7.0.0) (2022-02-25)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v6.0.2...v7.0.0)

* Move reusable part of `move request dialog box` to reusable component. Refs UIREQ-660.
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
* Requester name displayed incorrectly in hold shelf clearance report. Refs UIREQ-729.

## [6.0.2](https://github.com/folio-org/ui-requests/tree/v6.0.2) (2021-11-12)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v6.0.1...v6.0.2)

* When newly added patron is deleted after making and canceling request, requests page is unstable. Refs UIREQ-672.

## [6.0.1](https://github.com/folio-org/ui-requests/tree/v6.0.1) (2021-11-12)
[Full Changelog](https://github.com/folio-org/ui-requests/compare/v6.0.0...v6.0.1)

* Fix the issue when proxy pop-up and block pop-up appear at the same time for requests. Refs UIREQ-668.
* Fix the issue when `block` modal appears even if no manual blocks and vice versa. Refs UIREQ-670

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
