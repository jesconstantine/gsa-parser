// Search on key-up.
$(document).ready(function () {
   $('#query').keyup(function () {
       $('#content').load('php/curl.php div#results', { query : this.value });
   });
});

<form action="php/curl.php" method="POST" accept-charset="utf-8">
    <fieldset>
        <legend>Find a font</legend>
        <label for="query">Query</label><input type="text" name="query" value="" id="query" />
        <input type="submit" value="Search &rarr;" />
    </fieldset>
</form>
	
//END

// Search on Submit
$(document).ready(function(){

    $("#form").submit(function(){
    
        var query = $('#query').attr('value');
        $.get("php/curl.php", {
            "query": query
        }, function(data){
			$(data).appendTo("#content");
        });
        return false;
        
    }); // close form
}); // close docready

<div id="sidecontainer">
    <h2>Search</h2>
    <form action="php/curl.php" name="form" id="form" method="GET">
        <fieldset>
            <input type="text" id="query" name="query" size="22" maxlength="256" value="" /><input type="submit" name="button" value="Search" /><input type="hidden" name="site" value="dbCrawTestULResearchTools" /><input type="hidden" name="client" value="UL_FE_01" /><input type="hidden" name="output" value="xml_no_dtd" /><input type="hidden" name="proxystylesheet" value="UL_FE_01" /><input type="hidden" name="getfields" value="*" /><input type="hidden" name="num" value="100" /><input type="hidden" name="filter" value="0" /><input type="hidden" name="proxyreload" value="1" />
        </fieldset>
    </form>
</div>

// END


$.ajaxSetup({
    cache: false
});

// load on submit with passed values and returned div

$(document).ready(function(){
    $('#search').click(function(){
        $('#content').load('php/curl.php div#results', {
            query: $("#query").val()
        });
    });
});

        <form action="php/curl.php" name="gsa" id="gsa" method="POST">
            <label for="query">Query</label><input type="text" name="query" value="" id="query" />
       		<input id="search" type="button" value="Search &rarr;" />
        </form>
		
// alpha sort		
		
		                function sortAlpha(a, b){
                    return a.innerHTML > b.innerHTML ? 1 : -1;
                };
                $('div h1').sort(sortAlpha).parent().appendTo('div#content');
                //$('#tools').append(toolType + '<br />').sort;