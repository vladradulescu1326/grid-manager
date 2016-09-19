angular.module('gridManager',[]).service('gridManager', function($compile) {

    var self = this;

    //Select All checkbox templates
    var _selectAllContainer = "<div id='select-all-users'></div>";
    var _selectAllInput = "<input type='checkbox' name='selectAll' ng-model='gridManager.selectAll' ng-change='gridManager.didSelectAll()'></input>";

    //Filter Template
    var _filterTemplate = "<input type='text' class='table-filter' placeholder='Filter Users...'></input>";

    function GridManager(scope, gridOptions, tableId, doesNeedSelectAll, doesNeedQuickFilter, quickFilterPlaceHolder, customOptions) {
        var self = this;

        var _gridOptions = {};
        var _doesNeedSelectAll = doesNeedSelectAll;
        var _doesNeedQuickFilter = doesNeedQuickFilter;
        var _ignoreSelectEventFlag = false;
        var _scope = scope;
        var _tableID = tableId;

        self.selectAll = false;

        if (angular.isUndefined(gridOptions)) {
            console.log("Did not receive a valid gridOptions parameter. Aborting.");
            return null;
        }

        _gridOptions = gridOptions;

        _gridOptions.onGridReady = _gridReady;
        _doesNeedSelectAll = doesNeedSelectAll;

        if (doesNeedSelectAll) {
            _gridOptions.columnDefs.unshift({headerName: "", checkboxSelection: true, width: 20, suppressMenu: true, headerCellTemplate: _selectAllContainer});
        }

        //Populate options with default values
        _addDefaults();

        //Merge custom options over defaults
        if (angular.isDefined(customOptions)) {
            angular.extend(_gridOptions, customOptions);
        }


        // PUBLIC METHODS ======================================================
        self.setRowSelectedCallback = function(callback) {
            _selectRowCallback = callback;
        }

        self.setRowClickedCallback = function(callback) {
            _clickRowCallback = callback;
        }

        self.setSelectionChangedCallback = function(callback) {
            _changedSelectionCallback = callback;
        }

        // PRIVATE FUNCTIONS ===================================================

        function _didSelectAll() {
            _ignoreSelectEventFlag = true;
            if (self.selectAll) {
              _gridOptions.api.forEachNodeAfterFilter(function(node) {
                  node.setSelected(true);
              });
            } else {
                _ignoreSelectEventFlag = true;
                self.userGridOptions.api.deselectAll();
            }
            _ignoreSelectEventFlag = false;
        }

        function _onFilterChanged(searchText) {
            if (angular.isDefined(_gridOptions.api)) {
                _gridOptions.api.setQuickFilter(searchText);
            }
        }

        function _addDefaults() {
            _gridOptions.enableColResize =  false;
            _gridOptions.rowSelection = 'multiple';
            _gridOptions.suppressMenuColumnPanel = true;
            _gridOptions.suppressMenuFilterPanel = false;
            _gridOptions.suppressMenuMainPanel = true;
            _gridOptions.suppressContextMenu = true;
            _gridOptions.enableSorting = true;
        }

        function _injectFilter() {

            var filterInput = $compile(_filterTemplate)(_scope);
            var tableFilterID = "filter-table-" + _tableID;
            filterInput.attr('id', tableFilterID);

            var searchModel = "searchText" + _tableID.replace("-", "");
            filterInput.attr('ng-model', searchModel);
            filterInput = $compile(filterInput)(_scope);
            var tableElement = angular.element(document.getElementById(_tableID));

            _scope.$watch(searchModel, _onFilterChanged);

            tableElement.before(filterInput);
        }

        function _gridReady() {
            //inject a checkbox that selects everything into the div we placed in the header
            if (_doesNeedSelectAll) {
                var selectAll = $compile(_selectAllInput)(_scope);
                angular
                    .element(document.getElementById("select-all-users"))
                    .append(selectAll);
            }

            if (_doesNeedQuickFilter) {
                _gridOptions.enableFilter = true;
                _injectFilter();
            }
        }

        function _didClickRow() {
            if (angular.isDefined(_clickRowCallback)) {
                _clickRowCallback();
            }
        }

        function _didSelectRow(row) {
            if (_ignoreSelectEventFlag) {
                return;
            }

            if (row.node.selected && angular.isDefined(_selectRowCallback)) {
                _selectRowCallback(row);
            }
        }

        function _didChangeSelection() {

            if (angular.isDefined(_changedSelectionCallback)) {
                _changedSelectionCallback();

                if (!_ignoreSelectEventFlag) {
                    _scope.$apply();
                }
            }
        }
    }

    // API =====================================================================

    self.getManager = function(scope, gridOptions, tableId, doesNeedSelectAll, doesNeedQuickFilter, quickFilterPlaceHolder, customOptions) {

        return new GridManager(scope, gridOptions, tableId, doesNeedSelectAll, doesNeedQuickFilter, quickFilterPlaceHolder, customOptions);

    }

});
