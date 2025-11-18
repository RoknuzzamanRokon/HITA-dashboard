hp://localhost:3000/billing

curently implement only with point.



here can show user point,here can give point, give api key, give supplier permission, and ip adress parmision section.

give all separet componet. musbe follow ui desin vibe.

can handel this. only super user and admin



this page. need. 



all section temporay create i give api one by one then create fulll.

user point and user info show api:



url = "http://127.0.0.1:8001/v1.0/user/check-user-info/5779356081"



respons is:

{

    "id": "5779356081",

    "username": "roman",

    "email": "roman@gmail.com",

    "role": "general_user",

    "api_key": "ak_c6bbc7bb783744e19253501a6bf66f01",

    "api_key_expires_at": "2025-11-17T08:12:53",

    "points": {

        "total_points": 103000,

        "current_points": 99870,

        "total_used_points": 3130,

        "paid_status": "Paid",

        "total_rq": 1

    },

    "active_suppliers": [

        "hotelbeds",

        "tbohotel"

    ],

    "total_suppliers": 2,

    "created_at": "2025-05-16T18:26:31",

    "updated_at": "2025-11-15T08:12:53",

    "user_status": "general_user",

    "is_active": true,

    "using_rq_status": "Active",

    "created_by": "super_user: ursamroko@romel.com",

    "viewed_by": {

        "user_id": "5779356081",

        "username": "roman",

        "email": "roman@gmail.com",

        "role": "general_user"

    }

}





give point api is:

url = "http://127.0.0.1:8001/v1.0/user/points/give"

payload = json.dumps({

  "receiver_email": "safwan@gmail.com",

  "receiver_id": "b6146d77-e",

  "allocation_type": "one_month_package"

})



body like

// admin_user_package

// one_year_package

// one_month_package

// per_request_point

// guest_point

{

    "receiver_email": "safwan@gmail.com",

    "receiver_id": "b6146d77-e",

    "allocation_type": "one_month_package"

}



{

    "message": "Successfully gave 80000 points to safwan."

}





solve it first then give all one by one


































now for supplier permission option:
api key is:
