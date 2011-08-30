/* ===============================================================================================
 * REMOVE DUPLICATE ELEMENTS FUNCTION															 *
 =============================================================================================== */

function removeDuplicateElement(arrayName){
    var newArray = new Array();
    label: for (var i = 0; i < arrayName.length; i++) {
        for (var j = 0; j < newArray.length; j++) {
            if (newArray[j] == arrayName[i]) 
                continue label;
        }
        newArray[newArray.length] = arrayName[i];
    }
    return newArray;
}

/* ===============================================================================================
 * GET URL VARIABLES
 *
 * Gets variables passed to this page from another in a URL string
 *
 =============================================================================================== */

function getUrlVars(){
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
        vars[key] = value;
		
    });
    return vars;
}

$(document).ready(function(){
	//alert("ready");
	
	if (window.location.href.indexOf("librarianRecommended") !== -1) {
       	$('#libRec').addClass('active');
		$('#libRec').attr('checked',true)		  
    } else {
		$('#libRec').attr('checked',false)
	}
	
	if (window.location.href.indexOf("alphaSort=1") !== -1) {
			$('#alphaSort').attr('checked',true)
    } else {
			$('#alphaSort').attr('checked',false)
	}

	
	/* ===============================================================================================
	 * SET CONDITIONAL VARIABLES															 				 *
	 =============================================================================================== */

	if (window.location.href.indexOf("requiredFields") !== -1) {
		var	requiredFields = $.bbq.getState("requiredFields");
		var	requiredFieldsArray = requiredFields.split('\.');
		//alert('REQUIRED FIELDS!');
	} else {
		var requiredFields = $('#requiredFields').attr('value');
		//alert('ELSE REQUIRED FIELDS!');
	}
	
	if (window.location.href.indexOf("#") === -1) {
		// sets a query variable based on the query sent to this page
		var query = getUrlVars()["query"];
		// sets this page's search query text box value equal to what was passed to this page
		$('#query').val(query);
		//alert('#!');
	} else {
		var query = $.bbq.getState("query");
		$('#query').val(query);
		//alert('ELSE #');
	}
	
	$.bbq.pushState({ query: query, requiredFields: requiredFields });
	
	/* ===============================================================================================
	 * HASHCHANGE FUNCTION															 				 *
	 =============================================================================================== */
	
	$(window).bind( "hashchange", function(e) {

		
		query = $.bbq.getState("query");
		requiredFields = $.bbq.getState("requiredFields");
		if (window.location.href.indexOf("requiredFields") !== -1) {
			
			requiredFieldsArray = requiredFields.split('\.');
			
			$('ul#activeFilters>li').remove();
			
			$.each(requiredFieldsArray, function(itemIndex, filterHREF){
				
				var filterName = filterHREF.replace(/%20/g, ' ').replace('research:', '').replace(/and/g, '\&amp\;').replace('subject:', '');
					listItem = '<li><a class="filter active" href="' + filterHREF + '">' + filterName + '</a></li>';
				if (filterHREF != 'librarianRecommended:1') {
					$('ul#activeFilters').append(listItem);
				}
			});
			
			$('.active').live('click', function(e){
				e.preventDefault();
				
				filterHREF = $(this).attr('href');
				
				requiredFieldsArray = $.grep(requiredFieldsArray, function(value){
					return value != filterHREF;
				});
				
				return false;
			});
			
		}
		getResults (query, requiredFields);
		
	});

	/*================================================================================================
	 *  AJAX FUNCTION
	 * 
	 * This block of code is responsible for sending the search query data to the PHP cURL, which
	 * then sends that data to the GSA, which returns to the search results to the cURL script. The
	 * results are then echoed out, by the PHP script, as XML, which is loaded, by this AJAX function,
	 * for processesing by the parseXML function *
	 *  
	 ================================================================================================*/
		
	// set AJAX properties and query string variables for curl.php
	function getResults(query, requiredFields){
		
		var gsaURL = $('#gsaURL').attr('value');
			site = $('#site').attr('value');
			client = $('#client').attr('value');
			output = $('#output').attr('value');
			metaFields = $('#metaFields').attr('value');
			num = $('#num').attr('value');
			filter = $('#filter').attr('value');
			
		$.ajax({
			type: "POST",
			url: "php/curl.php",
			dataType: "xml",
			data: {
				num: num,
				filter: filter,
				requiredFields: requiredFields,
				gsaURL: gsaURL,
				query: query,
				site: site,
				client: client,
				output: output,
				metaFields: metaFields
			},
			success: parseXML,
			complete: function(){
				$('#results').fadeIn(1500)
			}
		}); // close ajax
	}
	
	/* ================================================================================================
	 * FORM SUBMISSION FUNCTION
	 * 
	 * This function handles the form-submission functionality
	 * 
	 =============================================================================================== */
	
	$('#gsa').submit(function(){	
		requiredFields = '';
		query = $('#query').attr('value');
		query = query.replace(/ /g, '%20');
		query = query.replace(/\'/g, "%27");
		$.bbq.pushState({ query: query, requiredFields: requiredFields });
		$('.ui-autocomplete').remove();
		
				
		return false;
    }); // close form

	/* ================================================================================================
	 * FILTER CLICK FUNCTION
	 * 
	 * This function handles the functionality of the filter anchor-tag-based elements.
	 * 
	 =============================================================================================== */
	
	$('a.filter').live('click', function(mouseEvent){
		mouseEvent.preventDefault();
		var itemID = $(this).attr('href');
		// Checks to see if the filter has an active class
		if ($(this).is('a.active')) {
			removePeriod(itemID, requiredFields);
			
		} else {			
			addPeriod(itemID, requiredFields);
		}
		return false;
	}); // close click
	
	/* ================================================================================================
	 * 
	 * PARSE XML FUNCTION
	 * 
	 * This function parses the XML that the Google Seach Appliance returns
	 * 
	 ================================================================================================ */
	
	// parse the XML
    function parseXML(xml){	
		//alert("parse");
		var	toolList = [];
			subjectList = [];
		
		$('ul#listOfToolFilters>li').remove();
		$('ul#listOfSubjectFilters>li').remove();
		$('#results').remove();
		$('#results-nav').remove();
		$('#spelling').remove();
		// remove the results when a new query is made		
	
		/* ================================================================================================
		 * CHECK FOR SPELLING SUGGESTIONS
		 * 
		 * This next bit of code checks for spelling suggestions and provides a clickable link that
		 * allows a user to re-submit their search query with the correctly-spelled query 
		 =============================================================================================== */
		
		if ($(xml).find('Spelling')) {
			
			// find and format the spelling suggestion
			$(xml).find('Spelling').each(function(){
				$(this).find('Suggestion').each(function(){
					var suggestion = $(this).attr('q');
					$('#content').append('<p id="spelling">Did you mean: <a href="' + suggestion + '" id="suggestion">' + suggestion + '</a>?</p>');
				});
			}); // close find spelling
			
			$('#suggestion').click(function(event){
				// prevent default anchor tag functionality
		        event.preventDefault();
				
				// set the search query to the href property of the query suggestion anchor tag
				query = $(this).attr('href');
				query = query.replace(/ /g, '%20');
				query = query.replace(/\'/g, "%27");
				// set the text in the search query field to the value of the query variable
				$('#query').val(query);
				
				$.bbq.pushState({query: query});
				
				$('#results-nav').remove();
				return false;		
		    }); //close click 
		} //close spelling if
		
		/* ================================================================================================
		 * PARSE RESULTS IF NO SPELLING ERRORS ARE FOUND
		 ================================================================================================ */

		var html = '<div id="results-nav" class="listNav"></div>';
		//open the Results UL
		html += '<ul id="results">';
		// Find each result and format it		
        $(xml).find('R').each(function(){
            var num = $(this).attr('N') + ". ";
				url = $(this).find('U').text();
				title = $(this).find('T').text();
				snippet = $(this).find('S').text();
				inode = $(this).find('MT:[N="inode"]').attr('V');
				detailsURL = 'https://www.uakron.edu/libraries/bierce_scitech/research_tools/research_tools_detail.dot?id=' + inode;
				
			html += '<li class="result ';
							
			$(this).find('MT:[N="research"]').each(function(){
				var toolType = 'research:' + $.trim($(this).attr('V')).replace(/ /g, '%20').toLowerCase();
				
				//checks to see if the toolType is in an active filter, and adds it to the toolList array if it isn't
				//toolList = removeDuplicateElement(toolList);
				if ($.inArray(toolType, requiredFieldsArray) === -1) {
						toolList.push(toolType);
				} 								
			}); // close toolTypes
			
			$(this).find('MT:[N="subject"]').each(function(){
				var subject = 'subject:' + $.trim($(this).attr('V')).replace(/ /g, '%20').toLowerCase();
				
				//checks to see if the toolType is in an active filter, and adds it to the toolList array if it isn't
				//subjectList = removeDuplicateElement(subjectList);
				if ($.inArray(subject, requiredFieldsArray) === -1) {
						subjectList.push(subject);
				} 								
			}); // close subects

            if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {                 
          		html += ' librarianRecommended'
            } 
			html += '">';
			html += '<ul class="resultDetails">';
			html += '<li class="title"><a href="' + url + '" class="url">' + title + '</a>';
			if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {
				html+= '<span class="librarianRecommended"><img src="img/thumbs_up.png" alt="Librarian Recommended" />Librarian Recommended</span></li>';
			} else {
				html+= '</li>'
			}
			html += '<li class="resultSnippet">' + snippet +'</li>';
			html += '<li class="moreDetailsURL"><a href="' + detailsURL + '">More Details</a></li>';
			html += '</ul></li>';	
			
        }); // close find result
        html += '</ul>'; // close the Results UL
		//append the results to the #content DIV
		$('#content').append(html);
		
		var toolList = removeDuplicateElement(toolList);
			subjectList = removeDuplicateElement(subjectList);

		// loops through the array of research tool types
		$.each(toolList, function(itemIndex, toolHREF){
			var	toolName = toolHREF.replace(/%20/g, ' ').replace('research:', '').replace(/and/g, '\&amp\;').toLowerCase(); //URL encodes spaces		
				listItem = '<li><a class="filter" href="' + toolHREF + '">' + toolName + '</a></li>';
				
			$('#listOfToolFilters').append(listItem);
		});
		
		// loops through the array of research tool types
		$.each(subjectList, function(itemIndex, subjectHREF){
			var	subjectName = subjectHREF.replace(/%20/g, ' ').replace('subject:', '').replace(/and/g, '\&amp\;').toLowerCase(); //URL encodes spaces		
				listItem = '<li><a class="filter" href="' + subjectHREF + '">' + subjectName + '</a></li>';

				
			$('#listOfSubjectFilters').append(listItem);
		});
		
		/*
		 * Alpha sorts the filter list
		 */		
		$('ul.filterList>li').tinysort();
		
		/*
		 * Checks to see if alphasorted is in the location bar and uses ListNav plugin on results
		 */
		
		if (window.location.href.indexOf("alphaSort=1") !== -1) {
			$('ul#results>li').tinysort();
			$('ul#results').listnav({
				includeAll: false,
				includeOther: true,
				flagDisabled: true,
				noMatchText: 'Nothing matched your filter; please click another letter.',
				showCounts: false,
				cookieName: 'my-main-list',
				prefixes: ['the', 'a']
			});
		} 
    } // close parseXML
    
	/* ===============================================================================================
	 * FILTER LIST SLIDE FUNCTION																	 * 
	 =============================================================================================== */
	
	$('a.slide').button({
            icons: {
                primary: "ui-icon-circle-triangle-e"
            }
	}).addClass('up').parent().children('ul').slideUp();
	$('a.slide').click(function(mouseEvent){
		mouseEvent.preventDefault();
		
		if ($(this).is('.up')) {
			$(this).button({
            icons: {
                	primary: "ui-icon-circle-triangle-s"
            	}
			}).removeClass('up').addClass('down').parent().children('ul').slideDown();
			
		} else {			
			$(this).button({
            icons: {
                	primary: "ui-icon-circle-triangle-e"
            	}
			}).removeClass('down').addClass('up').parent().children('ul').slideUp();
		}
		return false;
	});
	
	/* ===============================================================================================
	 * Librarian Recommended Function																	 * 
	 =============================================================================================== */

	
	$('#libRec').button({
		icons: {
			primary: "ui-icon-circle-close"
		}
	}).click(function(mouseEvent){
		mouseEvent.preventDefault();
		var itemID = $(this).attr('href');

		if ($(this).is('.active')) {		
			$('#libRec').button({
				icons: {
					primary: "ui-icon-circle-close"
				}
			});
			removePeriod(itemID, requiredFields);
			$(this).removeClass('active');
			//$(this).text("Show Only Library Recommended Resources").css('color', '#003499');	
		} else {
			
			$('#libRec').button({
				icons: {
					primary: "ui-icon-circle-check"
				}
			});
			
			addPeriod(itemID, requiredFields);
			$(this).addClass('active');
			//$(this).text("Only Showing Library Recommended Resources").css('color', '#467E51');		
		}		
		return false;
	});

	/* ===============================================================================================
	 * Alphabetical sort control  
	 =============================================================================================== */
    $('#alphaSort').button({
		icons: {
			primary: "ui-icon-circle-close"
		}
	}).click(function(mouseEvent){
            mouseEvent.preventDefault();
            if (window.location.href.indexOf("alphaSort=1") !== -1) {
				
				$('#alphaSort').button({
					icons: {
						primary: "ui-icon-circle-close"
					}
				});
				
                var alphaSort = 0;      
                $.bbq.pushState({alphaSort: alphaSort});					
            } else {
                    var alphaSort = 1;
                    $.bbq.pushState({alphaSort: alphaSort});
					$('#alphaSort').button({
					icons: {
						primary: "ui-icon-circle-check"
					}
					});
            }
            return false;
    });
	
	/* ===============================================================================================
	 * GSA Required Fields Remove Period function  
	 =============================================================================================== */
	
	function removePeriod(itemID, requiredFields ){
		// This next if/else-if statement removes periods between required fields in the GSA query string
		if (requiredFields.indexOf("." + itemID) !== -1) {
			var rep = '';
			var rem = '.' + itemID;
			requiredFields = requiredFields.replace(rem, rep);
		} else if (requiredFields.indexOf(itemID + ".") !== -1 && requiredFields.indexOf("." + itemID) !== 1) {
			var rem = itemID + '.';
			var rep = '';
			requiredFields = requiredFields.replace(rem, rep);
		} else {
			var rem = itemID;
			var rep = '';
			requiredFields = requiredFields.replace(rem, rep);
		}
		$.bbq.pushState({query: query, requiredFields: requiredFields});	
	}

	/* ===============================================================================================
	 * 	GSA Required Fields Add Period function													     * 
	 =============================================================================================== */

	function addPeriod(itemID, requiredFields) {
		// checks to see if there is already a filter in the query string and if it is, it adds a period between the new filter and itself
		if (window.location.href.indexOf("requiredFields") !== -1) {
			if (requiredFields.indexOf(":") !== -1) {
				requiredFields += ".";
			}
			requiredFields += itemID;
		}
		$.bbq.pushState({query: query, requiredFields: requiredFields});	
	}
	
	
	$('a#reset').button({icons: {
         primary: "ui-icon-arrowrefresh-1-e"
            }
	}).click(function(mouseEvent){
		mouseEvent.preventDefault();

		query = ('');
		requiredFields = ('');
		alphaSort = 0;
		$('#query').val(''); 
		$('#results').remove();
		$('#results-nav').remove();
		$('#spelling').remove();

	        $('a.slide').button({
                     icons: {
                	primary: "ui-icon-circle-triangle-e"
            	}
			}).removeClass('down').addClass('up').parent().children('ul').slideUp();

		$.bbq.pushState({query: query, requiredFields: requiredFields, alphaSort: alphaSort});   
		
		return false;
    });

	
	/* ===============================================================================================
	 * 	Ajax's to the GSA to get autocomplete options											     * 
	 =============================================================================================== */
	/*

 	var myArr = [];         
    $('#query').keyup(function(e){
		if (e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40) {
	        var gsaURL = $('#gsaURL').attr('value');
		        site = $('#site').attr('value');
		        client = $('#client').attr('value');
		        output = $('#output').attr('value');
		        metaFields = $('#metaFields').attr('value');
		        num = $('#num').attr('value');
		        filter = $('#filter').attr('value');
		        query = $('#query').attr('value');
	        $.ajax({
	            type: "POST",
	            url: "https://www.uakron.edu/applications/search/libraries/researchTools/gsa_curl.php",
	            dataType: "xml",
	            data: {
	                num: num,
	                filter: filter,
	                requiredFields: requiredFields,
	                gsaURL: gsaURL,
	                query: query,
	                site: site,
	                client: client,
	                output: output,
	                metaFields: metaFields
	            },
	            success: function autoXML(xml){
        					$(xml).find("R").each(function(){
					            myArr.push($(this).find('T').text().replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/&#39;/, "'").replace(/\&amp;/g, '&'));
								$(this).find('MT:[N="research"]').each(function(){
									myArr.push($(this).attr('V'));		 								
								}); // close toolTypes
								$(this).find('MT:[N="subject"]').each(function(){
									myArr.push($(this).attr('V'));		 								
								}); // close toolTypes
       						}); //close xml
							myArr = removeDuplicateElement(myArr);
							$("#query").autocomplete({
					            source: myArr,
					            minLength: 0,
								delay: 0,
					            select: function(event, ui){
					                var query = ui.item.value;
									$.bbq.pushState({ query: query, requiredFields: requiredFields });	
					            }
							});  // close autocomplete
    					} // close autoxml
	        }); // close ajax   
		} // close if
    });
   */
  

	$(window).trigger("hashchange");
});