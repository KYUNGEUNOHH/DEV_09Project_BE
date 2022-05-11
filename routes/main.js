const express = require('express');
const router = express.Router();
const db = require('../config');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/seoul');

const authMiddleware = require('../middlewares/auth');
const upload = require('../S3/s3');
const sharp = require("sharp");
const { fstat } = require('fs');

//게시글 작성
router.post('/postadd', authMiddleware, upload.single('image'), (req, res, next) => {
        const {title, content, price, headCount, category, endTime, address, lat, lng, } = req.body

        const writer = res.locals.user.userName;
        const User_userId = res.locals.user.userId;

        // const image = req.file?.location;
        // const today = moment();
        // const endtime = today.add(endTime, 'days').format();

        // 사진 리사이즈
        const image = req.file?.location;
        // console.log('filename:>>>>>>>>>>>>>>>>>>', req.file)

        // try {
        //     sharp(req.file.location).resize({ width: 600 })
        //     .withMetadata()
        //     .toBuffer((err, buffer) => {
        //         if (err) throw err;
        //         fs.writeFile(req.file.location, buffer, (err) => {
        //             if (err) throw err;
        //         });
        //     });

        // } catch (err) {
        //     console.log(err)
        // }
        // console.log('filename:>>>>>>>>>>>>>>>>>>' ,req.file)


        const today = moment();
        const endtime = today.add(endTime, 'days').format();
        
        const datas = [
            title,
            content,
            price,
            headCount,
            category,
            endtime,
            address,
            lat,
            lng,
            writer,
            User_userId,
            image,
        ];

        const sql =
            'INSERT INTO Post (`title`, `content`, `price`, `headCount`, `category`, `endTime`, `address`, `lat`, `lng`, `writer`, `User_userId`, `image`, `isDone`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,false)';

        db.query(sql, datas, (err, rows) => {
            if (err) {
                console.log(err);
                res.send({ msg: 'fail' });
            } else {
                db.query('INSERT INTO `JoinPost` (`Post_postId`, `User_userId`) VALUES (?,?)',[rows.insertId, User_userId], (err, join) => {
                    console.log("joinPost에 저장")
                })

                db.query('SELECT * FROM `Post` WHERE postId =?',rows.insertId, (err, row) => {
                    res.send({ msg: 'success', row});
                })
            }
        });
    },
);

//게시글 삭제
router.delete('/:postId', authMiddleware, (req, res, next) => {
    const postId = req.params.postId;
    const sql = 'DELETE FROM Post WHERE postId=?';

    db.query(sql, postId, function (err, result) {
        if (err) {
            console.log(err);
            res.status(201).send({ msg: 'fail' });
        } else {
            res.status(201).send({ msg: 'success' });
        }
    });
});

// 메인페이지 게시글 불러오기
router.get('/postlist', (req, res) => {
    const address = req.body.address.split(' ');
    const findAddr = address[0]+' '+address[1]+' '+address[2]

    console.log(findAddr)

    const addr = findAddr +'%'
    const sql = "SELECT * FROM Post WHERE address LIKE ? ORDER BY createdAt DESC"
    let headList = [];

    db.query(sql, addr, (err, main) => {
        if (err) console.log(err);

        for (list of main) {
            const sql = "SELECT P.*, GROUP_CONCAT(U.userId SEPARATOR ',') HeadList FROM `Post` P INNER JOIN `JoinPost` JP ON P.postId = JP.Post_postId INNER JOIN `User` U  ON JP.User_userId = U.userId WHERE P.postId =?"
            const postid = list.postId
            
            db.query(sql, postid, (err, data) => {
                data[0].HeadList = data[0].HeadList.split(',').map(id => Number(id))
                res.send({ msg: 'success', data });
            });
        }   
    })

});

// 메인페이지 게시글 상세보기
router.get('/postdetail', (req, res) => {
    const postId = req.body.postId;
    const sql = 'select * from Post where postId=?';

    db.query(sql, postId, (err, data) => {
        if (err) console.log(err);
        res.status(201).send({ msg: 'success', data });
    });
});

// 좋아요 생성 (수정본)
router.post('/like/:postId', authMiddleware, (req, res) => {
    const userId = res.locals.user.userId;
    const postId = req.params.postId;

    const sql = "SELECT `Post_postId`,`User_userId` FROM `Like` WHERE `Post_postId`=? and `User_userId`=?";

    db.query(sql, [postId, userId], (err, rows) => {

        if(rows.length === 0){  
            const sql = 'INSERT INTO `Like` (`Post_postId`,`User_userId`) VALUES (?,?)'

            db.query(sql, [Number(postId), userId], (err, like) => {
                if(err) console.log(err)
                res.send({msg:'success'});       
            });

        } else {
            res.send({msg:'fail'});  
        }
    })

});


// 좋아요 삭제
router.delete('/like/:postId', authMiddleware, (req, res) => {
    const userId = res.locals.user.userId;
    const postId = req.params.postId;

    const sql = "SELECT `Post_postId`,`User_userId` FROM `Like` WHERE `Post_postId`=? and `User_userId`=?";

    db.query(sql, [postId, userId], (err, rows) => {

        if(rows.length !== 0){  
            const sql = 'DELETE FROM `Like` WHERE `Post_postId`=? and `User_userId`=?'

            db.query(sql, [Number(postId), userId], (err, data) => {
                if(err) console.log(err)
                res.send({msg:'success'});       
            });

        } else {
            res.send({msg:'fail'});  
        }
    })

})

module.exports = router;
