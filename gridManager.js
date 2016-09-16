angular.module('gridManager',[]).service(function() {

    var self = this;

    var _gridOptions;

    var _doesNeedSelectAll = false;

    //Select All checkbox templates
    var _selectAllContainer = "<div id='select-all-users'></div>";
    var _selectAllInput = "<input type='checkbox' name='selectAll' ng-model='gridManager.selectAll' ng-change='gridManager.didSelectAll()'></input>";

    //Filter Template
    var _filterTemplate = "<input type='text' class='table-filter' placeholder='Filter Users...'" +
                        "onchange='gridManager.onFilterChanged(this.value)" +
                        "oninput='gridManager.onFilterChanged(this.value)" +
                        "onpaste='gridManager.onFilterChanged(this.value)'>";

    var _ignoreSelectEventFlag = false;

    self.selectAll = false;

    self.injectIn = function(gridOptions, tableId, doesNeedSelectAll, doesNeedQuickFilter, customOptions) {

        _gridOptions = gridOptions;

        _gridOptions.onGridReady = _gridReady;
        _doesNeedSelectAll = doesNeedSelectAll;

        if (doesNeedSelectAll) {
            gridOptions.columnDefs.shift({headerName: "", checkboxSelection: true, width: 20, suppressMenu: true, headerCellTemplate: _inputTemplate});
        }

        if (doesNeedQuickFilter) {
            gridOptions.enableFilter = true;
            _injectFilter();
        }

        //Populate options with default values
        _addDefaults();

        //Merge custom options over defaults
        angular.extend(_gridOptions, customOptions);

    };

    self.didSelectAll = function() {
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

    self.onFilterChanged = function(searchText) {
        _gridOptions.api.setQuickFilter(searchText);
    }

    // PRIVATE FUNCTIONS

    function _addDefaults() {
        _gridOptions.enableColResize =  false,
        _gridOptions.rowSelection: 'multiple',
        _gridOptions.suppressMenuColumnPanel: true,
        _gridOptions.suppressMenuFilterPanel: false,
        _gridOptions.suppressMenuMainPanel: true,
        _gridOptions.suppressContextMenu: true,
        _gridOptions.enableSorting: true
    }

    function _injectFilter() {

        var filterInput = $compile(_filterTemplate)($scope);
        var tableFilterID = "filter-table-" + _tableID;
        filterInput.attr('id', tableFilterID);
        var tableElement = angular.element(document.getElementById(_tableID));

        tableElement.before(filterInput);
    }

    function _gridReady() {
        //inject a checkbox that selects everything into the div we placed in the header
        if (_doesNeedSelectAll) {
            var selectAll = $compile(_selectAllInput)($scope);
            angular
                .element(document.selectElementById("select-all-users"))
                .append(selectAll);
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
            _selectRowCallback();
        }
    }

    function _didChangeSelection() {

        if (angular.isDefined(_changedSelectionCallback)) {
            _changedSelectionCallback();
            
            if (!_ignoreSelectEventFlag) {
                $scope.$apply();
            }
        }
    }

});
