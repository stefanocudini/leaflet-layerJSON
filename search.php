<?php

@header('Content-type: application/json; charset=utf-8');

$jsonp = true;

if($jsonp and isset($_GET['call_jsonp']) and !empty($_GET['call_jsonp']))
	$jsonpCall = trim($_GET['call_jsonp']);
else
	$jsonpCall = false;

if($jsonp===false and isset($_GET['call_jsonp']))
	die("jsonp not support");

if(isset($_GET['lat1'],$_GET['lon1'],$_GET['lat2'],$_GET['lon2'])):	//BOUNDINGBOX

		list($lat1,$lon1,$lat2,$lon2) = array_map('floatval',array($_GET['lat1'],$_GET['lon1'],$_GET['lat2'],$_GET['lon2']));
#		$box = array(array($lat1,$lon1),array($lat2,$lon2));

		$colors = arrayColors();
		$coords = array();

		for($n=0; $n<10; $n++)
		{
			$data = $colors[array_rand($colors)];
			$data['loc']= array(randf( min($lat1,$lat2), max($lat1,$lat2) ),
								randf( min($lon1,$lon2), max($lon1,$lon2) ));
			$coords[]= $data;
		}

		$json = json_encode( $coords );
		echo $jsonpCall ? $jsonpCall."($json);" : $json;
endif;

function randf ($min,$max) {
   return ($min+lcg_value()*(abs($max-$min)));
}

function arrayColors($m=147)	//generate random json object
{
	$colors = array();
	if ($cf = fopen('htmlcolors.txt', 'r'))
	{
		while($row = fgetcsv($cf, 200, ":") and --$m)
			$colors[]= array('title'=>$row[0], 'color'=>$row[1], 'id'=>$m);
		fclose($cf);
	}
	return $colors;
}
?>
