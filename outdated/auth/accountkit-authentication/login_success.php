<?php
  // Initialize variables
  $app_id = '<facebook_app_id>';
  $secret = '<account_kit_app_secret>';
  $version = 'v1.1';

  // Method to send Get request to url
  function doCurl($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $data = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $data;
  }

  // Exchange authorization code for access token
  $token_exchange_url = 'https://graph.accountkit.com/'.$version.'/access_token?'.
    'grant_type=authorization_code'.
    '&code='.$_POST['code'].
    "&access_token=AA|$app_id|$secret";
  $data = doCurl($token_exchange_url);
  $user_id = $data['id'];
  $user_access_token = $data['access_token'];
  $refresh_interval = $data['token_refresh_interval_sec'];

  // call Graphcool authenticateAccountKitUser mutation with $user_access_token

  echo '<div>'.$user_access_token.'</div>';
?>