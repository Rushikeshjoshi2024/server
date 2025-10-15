// const express = require('express')
// const multer = require('multer');
// const mysql = require('mysql')
// const cors = require('cors')
// const session = require('express-session')
// const cookieParser = require('cookie-parser')
// const bodyParser = require('body-parser')
// const jwt = require('jsonwebtoken')
// const fs = require('fs');
// const path = require('path');
// const FileStore = require('session-file-store')(session);
// // const { OAuth2Client } = require('google-auth-library');
// // const users = {};

// const app = express()
// const allowedOrigins = ['https://ms1-git-main-rush-js-projects.vercel.app']; // Replace with your actual React app URL
// const options = {
//     origin: (origin, callback) => {
//         if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
// };

// app.use(cors(options));

// // app.use(cors());
// app.use(express.json());
// app.use(cookieParser());
// app.use(bodyParser.json());

// app.use(session({
//     secret: 'secret',
//     store: new FileStore({ path: './sessions' }),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: false,
//         httpOnly: true,
//         maxAge: 3600000,
//     },
// }));



// const db = mysql.createConnection({
//     host: 'bhjmssgtsckntcydrzmy-mysql.services.clever-cloud.com',
//     user: 'ukxtfww4kx9gpssc',
//     password: 'pttLHJgGyANkVsmQDNfv',
//     database: 'bhjmssgtsckntcydrzmy'
// })


// app.get('/', (req, res) => {
//     if (req.session.seller_email) {
//         return res.json({ valid: true, user: 'seller', id: req.session.seller_id })
//     }
//     else if (req.session.user_email) {
//         return res.json({ valid: true, user: 'person', user_email: req.session.user_email })
//     }
//     else {
//         return res.json({ valid: false })

//     }

// })
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads/';
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath);
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// })
// const upload = multer({ storage: storage });

// // --------------------------Seller registration---------------------
// app.post('/seller_reg', (req, res) => {
//     const sql = "INSERT INTO `seller_details`(`seller_email`,`owner_name`, `seller_mobile_no`, `shop_name`, `seller_password`) VALUES (?)";
//     const values = [
//         req.body.shop_email,
//         req.body.owner_name,
//         req.body.shop_mo_no,
//         req.body.shop_name,
//         req.body.shop_password,
//         // req.body.shop_name,
//     ]
//     db.query(sql, [values], (err, data) => {
//         if (err) {
//             return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
//         }
//         return res.json({ success: true, message: "Registered successfully.", data: data });
//     });
// })

const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// const FileStore = require('session-file-store')(session); // REMOVED: Not suitable for Render

const app = express();

// --- CORS Configuration (Your CORS setup is already good!) ---
const allowedOrigins = ['https://ms1-git-main-rush-js-projects.vercel.app', 'http://localhost:3000/'];
const options = {
    // origin: (origin, callback) => {
    //     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
    //         callback(null, true);
    //     } else {
    //         callback(new Error('Not allowed by CORS'));
    //     }
    // },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// --- Middleware ---

// ADDED: Trust the reverse proxy from Render
app.set('trust proxy', 1);

app.use(cors(options));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// --- Session Configuration (Corrected) ---
app.use(session({
    // CHANGED: Use an environment variable for your secret in production
    secret: process.env.SESSION_SECRET || 'a-strong-secret-for-development',

    // REMOVED: FileStore is not persistent on Render. 
    // The default MemoryStore will be used. This is okay for testing, 
    // but for production, consider a database store like connect-redis or connect-mongo.
    // store: new FileStore({ path: './sessions' }), 

    resave: false,
    saveUninitialized: false, // Recommended to be false to avoid empty sessions
    cookie: {
        secure: true,   // CHANGED: MUST be true for cross-site cookies on HTTPS
        httpOnly: true, // Good for security
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'none' // CHANGED: MUST be 'none' for cross-site cookies
    },
}));


const db = mysql.createConnection({
    host: 'bhjmssgtsckntcydrzmy-mysql.services.clever-cloud.com',
    user: 'ukxtfww4kx9gpssc',
    password: 'pttLHJgGyANkVsmQDNfv',
    database: 'bhjmssgtsckntcydrzmy'
});


// --- Your Routes (No changes needed in the routes themselves) ---

// This route should now work correctly after login
app.get('/', (req, res) => {
    console.log("Checking session:", req.session); // Add a log for debugging
    if (req.session.seller_email) {
        return res.json({ valid: true, user: 'seller', id: req.session.seller_id, seller_email: req.session.seller_email });
    }
    else if (req.session.user_email) {
        return res.json({ valid: true, user: 'person', user_email: req.session.user_email });
    }
    else {
        return res.json({ valid: false });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage });

// ... (the rest of your routes are fine)
app.post('/seller_login', (req, res) => {
    const sql = "SELECT * FROM `seller_details` WHERE seller_email= ? and seller_password= ?";
    db.query(sql, [req.body.seller_email, req.body.seller_password], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        if (data.length > 0) {
            // This logic is correct. With the fixed session config, it will now work.
            req.session.seller_email = data[0].seller_email;
            req.session.seller_id = data[0].seller_id;

            // It's good practice to save the session before sending the response
            req.session.save(err => {
                if (err) {
                    return res.json({ Login: false, message: "Error saving session" });
                }
                console.log("Session created for seller:", req.session.seller_email);
                return res.json({ Login: true, seller_email: req.session.seller_email });
            });
        }
        else {
            return res.json({ Login: false });
        }
    });
});
// // --------------------------Seller registration---------------------
app.post('/seller_reg', (req, res) => {
    const sql = "INSERT INTO `seller_details`(`seller_email`,`owner_name`, `seller_mobile_no`, `shop_name`, `seller_password`) VALUES (?)";
    const values = [
        req.body.shop_email,
        req.body.owner_name,
        req.body.shop_mo_no,
        req.body.shop_name,
        req.body.shop_password,
        // req.body.shop_name,
    ]
    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Registered successfully.", data: data });
    });
})
// ... (your other routes) ...


// --- Server Listening (Corrected) ---
// const PORT = process.env.PORT || 3001; // Render provides the PORT env variable
// app.listen(PORT, () => {
//     console.log(`Server connected on port ${PORT}...`);
// });

app.post('/update_seller', (req, res) => {
    const sql = "UPDATE `seller_details` SET `seller_address`=?,`seller_mobile_no`=?,`seller_email`=?,`seller_password`=?, `state`=?, `district`=?, `street`=?, `landmark`=?, `pincode`=? WHERE `seller_id`=?";
    db.query(sql, [req.body.seller_address, req.body.seller_mobile_no, req.body.seller_email, req.body.seller_password, req.body.state, req.body.district, req.body.street, req.body.landmark, req.body.pincode, req.session.seller_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Your information is updated successfully.", data: data });
    });
})
app.post('/update_seller_image', upload.single('image'), (req, res) => {
    const sql = "UPDATE `seller_details` SET `shop_image`=? WHERE `seller_id`=?";

    db.query(sql, [req.file.filename, req.session.seller_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Your cover image is updated successfully.", data: data });
    });
})
app.post('/update_seller_logo', upload.single('logo'), (req, res) => {
    const sql = "UPDATE `seller_details` SET `shop_logo`=? WHERE `seller_id`=?";

    db.query(sql, [req.file.filename, req.session.seller_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Your logo is updated successfully.", data: data });
    });
})
var id = 0;
app.post('/seller_login', (req, res) => {
    const sql = "SELECT * FROM `seller_details` WHERE seller_email= ? and seller_password= ?";
    db.query(sql, [req.body.seller_email, req.body.seller_password], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        if (data.length > 0) {
            req.session.user = { email: data[0].seller_email, id: data[0].seller_id };

            req.session.seller_email = data[0].seller_email;
            req.session.seller_id = data[0].seller_id;
            return res.json({ Login: true, seller_email: req.session.seller_email });
        }
        else {
            return res.json({ Login: false });

        }
    });

})

app.post('/seller_details', (req, res) => {
    const sql = "SELECT * FROM `seller_details` WHERE seller_id= ? ";
    db.query(sql, [req.body.seller_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        if (data.length > 0) {
            return res.json({ success: true, message: "Data retrieved successfully.", data });
        }
        else {
            return res.json({ Login: false });

        }
    });

})

// --------------------------User registration---------------------
app.post('/all_sellers_home', (req, res) => {
    res.setHeader('Accept-Ranges', 'bytes');

    const sql = "SELECT seller_details.*,COUNT(material_details.seller_id) as count FROM seller_details  left join material_details on (seller_details.seller_id = material_details.seller_id) and seller_details.login_status='Y' group by material_details.seller_id LIMIT ?";
    db.query(sql, [req.body.val], (err, data) => {
        if (err) {
            // console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});


app.get('/all_sellers', (req, res) => {
    const sql = "SELECT seller_details.*,COUNT(material_details.seller_id) as count FROM seller_details  left join material_details on (seller_details.seller_id = material_details.seller_id) and seller_details.login_status='Y' group by material_details.seller_id";
    db.query(sql, (err, data) => {
        if (err) {
            // console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.get('/all_category', (req, res) => {


    // const sql = "SELECT * FROM material_category"; // Removed backticks from the table name
    const sql = "SELECT material_category.*,COUNT(material_details.category_id) as count FROM material_category left join material_details on (material_category.category_id = material_details.category_id) group by material_details.category_id"; // Removed backticks from the table name
    db.query(sql, (err, data) => {
        if (err) {
            // console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.get('/all_material', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN material_category ON material_details.category_id=material_category.category_id"; // Removed backticks from the table name
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/latest_material_by_seller', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id  WHERE seller_details.seller_id=? ORDER BY RAND() LIMIT ?"; // Removed backticks from the table name
    // const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY RAND() LIMIT ?"; 
    db.query(sql, [req.body.seller_id, req.body.val], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/all_material_by_seller', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id  WHERE seller_details.seller_id=? "; // Removed backticks from the table name
    // const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY RAND() LIMIT ?"; 
    db.query(sql, [req.session.seller_id], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/search', (req, res) => {
    const sql = "SELECT * FROM material_details " +
        "JOIN material_category ON material_details.category_id = material_category.category_id " +
        "JOIN seller_details ON material_details.seller_id = seller_details.seller_id " +
        "WHERE material_name = ?";
    // const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY RAND() LIMIT ?"; 
    db.query(sql, [req.body.searchQuery], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});

app.post('/all_material_by_seller_list', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id  WHERE seller_details.seller_id=? ORDER BY material_details.category_id";
    db.query(sql, [req.body.seller_id], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/latest_material', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY id DESC LIMIT ?"; // Removed backticks from the table name
    // const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY RAND() LIMIT ?"; 
    db.query(sql, [req.body.val], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/featured_material', (req, res) => {
    // const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY id DESC LIMIT ?"; // Removed backticks from the table name
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id JOIN material_category ON material_category.category_id=material_details.category_id ORDER BY RAND() LIMIT ?";
    db.query(sql, [req.body.val], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});
app.post('/material_details', (req, res) => {
    const sql = "SELECT * FROM material_details JOIN seller_details ON material_details.seller_id=seller_details.seller_id  JOIN material_category ON material_category.category_id=material_details.category_id WHERE id=?"; // Removed backticks from the table name
    // db.query(sql, (err, data) => {
    db.query(sql, [req.body.mat_id], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });
});

app.post('/user_reg', (req, res) => {
    const sql = "INSERT INTO `user`( `user_name`, `user_email`, `user_password`)VALUES (?)";
    const values = [
        req.body.user_name,
        req.body.user_email,
        req.body.user_password,
        // req.body.shop_name,
    ]
    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Registered successfully.", data: data });
    });
})

app.post('/user_login', (req, res) => {
    const sql = "SELECT * FROM `user` WHERE user_email= ? and user_password= ?";
    db.query(sql, [req.body.user_email, req.body.user_password], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        if (data.length > 0) {
            req.session.user_email = data[0].user_name;
            req.session.user_id = data[0].user_id;
            const email = data[0].user_email;
            return res.json({ Login: true, user_email: req.session.user_email });
        }
        else {
            return res.json({ Login: false });

        }
    });

})

app.get('/my_account', (req, res) => {
    let size = 0;
    const sql1 = "SELECT * FROM material_details WHERE seller_id=?";
    db.query(sql1, [req.session.seller_id], (err, data1) => {
        size = data1.length;
    });

    const sql = "SELECT * FROM seller_details WHERE seller_id=?";
    db.query(sql, [req.session.seller_id], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data, size });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });

});
app.get('/user_account', (req, res) => {
    let size = 0;
    const sql = "SELECT * FROM user WHERE user_id=?";
    db.query(sql, [req.session.user_id], (err, data) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).json({ success: false, message: "An error occurred, Please try again." });
        }
        if (data.length > 0) {
            return res.status(200).json({ success: true, message: "Data retrieved successfully.", data, size });
        } else {
            return res.status(404).json({ success: false, message: "No data found." });
        }
    });

});

app.post('/update_user', (req, res) => {
    const sql = "UPDATE `user` SET `user_name`=?,`user_email`=?,`mobile_no`=?,`user_password`=? WHERE `user_id`= ?";
    db.query(sql, [req.body.name, req.body.email, req.body.mobile_number, req.body.password, req.session.user_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Your information is updated successfully.", data: data });
    });
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json({ message: "Logout successful" });
    });
})

app.post('/mat_reg', upload.single('image'), (req, res) => {
    const sql = "INSERT INTO `material_details`( `material_name`, `category_id`, `material_price`,`selling_price`,`material_brand`,`material_color`,`material_image`,`seller_id`,`isExclusive`)VALUES (?)";
    // const { Material_Name, Material_category, Material_price, Material_brand, Material_color, id } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const values = [
        req.body.Material_Name,
        req.body.Material_category,
        req.body.Material_price,
        req.body.Material_sell_price,
        req.body.Material_brand,
        req.body.Material_color,
        imagePath,
        req.body.id,
        req.body.isExec,
        // req.body.shop_name,
    ]

    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json({ success: false, message: "Error occurred, Please try again.", error: err });
        }
        return res.json({ success: true, message: "Registered successfully.", data: data });
    });
})

app.listen(443, () => {
    console.log("Connected...");
})