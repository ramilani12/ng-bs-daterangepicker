**
 * @license ng-bs-daterangepicker v0.0.5
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ng-bs-daterangepicker
 * (c) 2016 Raphael Milani https://github.com/ramilani12/ng-bs-daterangepicker
 * License: MIT
 */
(function(angular) {
	'use strict';
	angular.module('ngBootstrap', [])
		.directive('input', ['$compile', '$parse', '$filter','$locale', function($compile, $parse, $filter,$locale) {
			return {
				restrict: 'EA',
				require: '?ngModel',
				link: function($scope, $element, $attributes, ngModel) {
					
					if ($attributes.type !== 'daterange' || ngModel === null) {
						return;
					}

					var fired = false;
					var options = {} 
					
					/*options.format = $attributes.format || 'YYYY-MM-DD';
					options.separator = $attributes.separator || ' - ';
					options.minDate = $attributes.minDate && moment($attributes.minDate);
					options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
					options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function(elem, index) {
						return index === 0 && parseInt(elem, 10) || elem;
					}));
					options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
					options.locale = $attributes.locale && $parse($attributes.locale)($scope);
					options.opens = $attributes.opens || $parse($attributes.opens)($scope);*/

					var extendedOptions = $parse($attributes.options)($scope);
					options = angular.merge(extendedOptions,options);
					
					if (options.singleDatePicker){
						options.autoUpdateInput = options.autoUpdateInput || false; 
						options.separator = "";
						options.autoApply = true;
					}
					
					if (angular.isUndefined(options.locale) || options.locale == null ){
						options.locale = {}
						var fmt;
						
						if (options.timePicker){
							fmt = $locale.DATETIME_FORMATS.short.replace(/y/g, 'Y').replace(/d/g, 'D');
						}else{
							fmt  = $locale.DATETIME_FORMATS.shortDate.replace(/y/g, 'Y').replace(/d/g, 'D');
						}	
							
						options.locale.format = fmt;
						options.locale.daysOfWeek =  $locale.DATETIME_FORMATS.SHORTDAY;
						options.locale.monthNames =  $locale.DATETIME_FORMATS.SHORTMONTH;
					}
					
					options.separator = options.separator || "-";
					
					function datify(date) {
						return moment.isMoment(date) ? date.toDate() : date;
					}

					function momentify(date) {
						return (!moment.isMoment(date)) ? moment(date) : date;
					}

					function format(date) {
						var dateMoment = momentify(date);
						return dateMoment.format(options.locale.format);
					}

					function formatted(dates) {
						//Date from Database
						if (angular.isString(dates)){
							return [format(dates)];
						}
						
						if (options.singleDatePicker){
							return [format(dates.startDate)];
						}else{
							return [format(dates.startDate), format(dates.endDate)].join(options.separator);
						}
						
					}

					ngModel.$render = function() {
						if (!ngModel.$viewValue) {
							return;
						}
						$element.val(formatted(ngModel.$viewValue));
					};

					/*$attributes.$observe('ngModel', function (value) {
						$scope.$watch(value, function (newValue) {
							$element.data('daterangepicker').startDate = momentify(newValue.startDate);
							$element.data('daterangepicker').endDate = momentify(newValue.endDate);
							$element.data('daterangepicker').updateView();
							$element.data('daterangepicker').updateCalendars();
							$element.data('daterangepicker').updateElement();
						});
						
					});*/
					
					$scope.$on('$destroy', function() {
						$element.data('daterangepicker').remove();
					});
					
					$scope.$watch(function() { return $attributes.ngModel; }, function(modelValue, oldModelValue) {
						if (!$scope[modelValue] || (!$scope[modelValue].startDate)) {
							if (options.autoUpdateInput){
								ngModel.$setViewValue({
									startDate: moment().startOf('day'),
									endDate: moment().startOf('day')
								});
							}
							return;
						}

						if (oldModelValue !== modelValue) {
							return;
						}

						$element.data('daterangepicker').startDate = momentify($scope[modelValue].startDate);
						if (!options.singleDatePicker){
							$element.data('daterangepicker').endDate = momentify($scope[modelValue].endDate);
						}	
						$element.data('daterangepicker').updateView();
						$element.data('daterangepicker').updateCalendars();
						$element.data('daterangepicker').updateInputText();

					});

					$element.daterangepicker(options, function(start, end, label) {

						var modelValue = ngModel.$viewValue;
                        
                        if (modelValue == null || angular.isUndefined(modelValue)){
                            return;
                        }

						if (angular.equals(start, modelValue.startDate) && angular.equals(end, modelValue.endDate)) {
							return;
						}

						$scope.$apply(function() {
							fired = true;
							if (options.singleDatePicker){
								ngModel.$setViewValue({
									startDate: (moment.isMoment(modelValue.startDate)) ? start : start.toDate()
								});
							}else{
								ngModel.$setViewValue({
									startDate: (moment.isMoment(modelValue.startDate)) ? start : start.toDate(),
									endDate: (moment.isMoment(modelValue.endDate)) ? end : end.toDate()
								});
							}
							ngModel.$render();
						});

					});
					
					$element.on('apply.daterangepicker',function(ev,picker){
						ev.preventDefault();
						if (fired) return;
						
						$scope.$apply(function() {
							if (options.singleDatePicker){
								ngModel.$setViewValue({
									startDate: (moment.isMoment(picker.startDate)) ? picker.startDate : picker.startDate.toDate()
								});
							}else{
								ngModel.$setViewValue({
									startDate: (moment.isMoment(picker.startDate)) ? picker.startDate : picker.startDate.toDate(),
									endDate: (moment.isMoment(picker.endDate)) ? picker.endDate : picker.endDate.toDate()
								});
							}
							ngModel.$render();
						});	
					});
				}
			};

		}]);

})(angular);