<?php

//{ "msg": "something is right", "valid": true }

if(isset($_GET['input'])){

    $input = $_GET['input'];

    // your code .. here

    if($input == 'felix'){
        $msg = [
            'msg' => 'username exists',
            'valid' => false
        ];         
    } else {
        $msg = [
            'msg' => 'something is right',
            'valid' => true
        ];          
    }

  

}else{

    $msg = [
        'msg' => 'something is wrong',
        'valid' => false
    ];

}

print_r(json_encode($msg));
