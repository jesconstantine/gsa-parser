<?php

// https://www.uakron.edu/applications/search/libraries/researchTools/gsa_curl.php

$ch = curl_init(); // cURL initialization

#set the search query and replace specials
$query = $_POST['query']; // the search query
#$query = str_replace(' ', '%20', $query);
#$query = str_replace("'", "%27", $query);

#set the search variables
$gsaURL = $_POST['gsaURL']; // the URL of the GSA
$requiredFields = $_POST['requiredFields']; // filter meta tag fields
$metaFields = $_POST['metaFields']; // meta tag fields
$client = $_POST['client']; // the GSA front-end to use
$site = $_POST['site']; // the collection to search
$num = $_POST['num']; // number of results to return per page (set to 1000)
$output = $_POST['output']; // type of output (set to xml_no_dtd)
$filter = $_POST['filter'];

// 2. set options
curl_setopt($ch, CURLOPT_URL, $gsaURL . 'site=' . $site . '&client=' . $client . '&output=' . $output . '&getfields=' . $metaFields . '&num=' . $num . '&filter=' . $filter . '&requiredfields='. $requiredFields .'&q=' . $query);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1); 

// 3. execute and fetch the resulting html output
$output = curl_exec($ch);

$output = str_replace('<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>', '<?xml version="1.0"?>', $output);

//$output = str_replace('“', '&quot;' , $output);
//$output = str_replace('”', '&quot;', $output);
//$output = str_replace('–', '-', $output);
//$output = str_replace('—', '-', $output);

$output = str_replace('Â', '', $output);
$output = str_replace('©', '&copy;' , $output);
$output = str_replace('®', '&reg;', $output);
$output = str_replace(chr(130), ',', $output);    // baseline single quote
$output = str_replace(chr(132), '"', $output);    // baseline double quote
$output = str_replace(chr(133), '...', $output);  // ellipsis
$output = str_replace(chr(145), "'", $output);    // left single quote
$output = str_replace(chr(146), "'", $output);    // right single quote
$output = str_replace(chr(147), '"', $output);    // left double quote
$output = str_replace(chr(148), '"', $output);    // right double quote
$output = str_replace(chr(151), '-', $output);    // right double quote

$output = mb_convert_encoding($output, 'HTML-ENTITIES', 'UTF-8');

header('Content-type: text/xml');
echo $output;

?>