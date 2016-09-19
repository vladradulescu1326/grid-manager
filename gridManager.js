angular.module('gridManager',[]).service('gridManager', function($compile) {

    var self = this;

    //Select All checkbox templates
    var _selectAllContainer = "<div id='select-all-users'></div>";
    var _selectAllInput = "<input type='checkbox'></input>";

    //Filter Template
    var _filterTemplate = "<input type='text' class='table-filter'></input>";

    function GridManager(scope, gridOptions, tableId, doesNeedSelectAll, doesNeedQuickFilter, quickFilterPlaceHolder, customOptions) {
        var self = this;

        var _gridOptions = {};
        var _doesNeedSelectAll = doesNeedSelectAll;
        var _doesNeedQuickFilter = doesNeedQuickFilter;
        var _ignoreSelectEventFlag = false;
        var _scope = scope;
        var _tableID = tableId;
        var _selectAllModel = "";
        var _quickFilterPlaceHolder = quickFilterPlaceHolder;

        var _clickRowCallback;
        var _selectRowCallback;
        var _changedSelectionCallback;

        self.selectAll = false;

        if (angular.isUndefined(gridOptions)) {
            console.log("Did not receive a valid gridOptions parameter. Aborting.");
            return null;
        }

        _gridOptions = gridOptions;

        _gridOptions.onGridReady = _gridReady;
        _gridOptions.onRowSelected = _didSelectRow;
        _gridOptions.onSelectionChanged = _didChangeSelection;
        _gridOptions.onRowClicked = _didClickRow;

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
            var selected = _scope[_selectAllModel];
            if (selected) {
              _gridOptions.api.forEachNodeAfterFilter(function(node) {
                  node.setSelected(true);
              });
            } else {
                _ignoreSelectEventFlag = true;
                _gridOptions.api.deselectAll();
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

            var filterInput = angular.element(_filterTemplate);
            var tableFilterID = "filter-table-" + _tableID;
            var searchModel = "searchText" + _tableID.replace("-", "");
            filterInput.attr('id', tableFilterID);
            filterInput.attr('ng-model', searchModel);
            filterInput.attr('placeholder', _quickFilterPlaceHolder);
            filterInput = $compile(filterInput)(_scope);

            angular
                .element(document.getElementById(_tableID))
                .before(filterInput);

            _scope.$watch(searchModel, _onFilterChanged);
        }

        function _injectSelectAll() {
            var selectAll = $compile(_selectAllInput)(_scope);
            selectAll.attr("name", "select-all-" + _tableID);
            _selectAllModel = "selectAll" + _tableID.replace("-", "");
            selectAll.attr("ng-model", _selectAllModel);
            selectAll = $compile(selectAll)(_scope);
            angular
                .element(document.getElementById("select-all-users"))
                .append(selectAll);

            _scope.$watch(_selectAllModel, _didSelectAll);
        }

        function _gridReady() {
            //inject a checkbox that selects everything into the div we placed in the header
            if (_doesNeedSelectAll) {
                _injectSelectAll();
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
