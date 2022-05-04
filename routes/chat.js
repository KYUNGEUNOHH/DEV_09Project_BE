const express = require('express');
const router = express.Router();
const db = require('../config');
// const moment = require('moment');
// require('moment-timezone');
// moment.tz.setDefault('Asia/seoul');

const authMiddleware = require('../middlewares/auth');



//거래 참여자 추가 (방장만 권한)
router.post('/deal/add/:userId', authMiddleware, (req, res, next) => {
    const postId = req.body.postId
    const joinId = req.body.userId  //추가할 id 받아오기 (param으로 넘겨주는가?)
    // const joinId = res.paramsId;
    const user = res.locals.user.userId;  //수정원하는 자
    
    const sql = "SELECT * FROM `Post` WHERE `postId`=?";
    db.query(sql, postId, (err, rows) => {

        if (rows[0].User_userId === user) {
            const sql = "SELECT * FROM `JoinPost` WHERE `User_userId`=? and `Post_postId`=?"
            db.query(sql, [joinId, Number(postId)], (err, join) => {
                if(join.length === 0) {
                    const sql = "INSERT INTO `JoinPost` (`User_userId`, `Post_postId`) VALUES (?,?)";
                    db.query(sql, [joinId, Number(postId)], (err, join) => {
                        res.send({ msg: 'success'}); 
                    })
                } else {
                    console.log("이미 추가됨")
                    res.send({ msg: 'fail'});
                }
            })
        } else {
            console.log("권한 없음")
            res.send({ msg: 'fail'});
        }
    });
});


//거래 참여자 삭제
router.post('/deal/add/:userId', authMiddleware, (req, res, next) => {
    const postId = req.body.postId
    const joinId = req.body.userId  //추가할 id 받아오기 (param으로 넘겨주는가?)
    // const joinId = res.paramsId;
    const user = res.locals.user.userId;  // 수정원하는 자
    
    // 게시글 작성자 찾기
    const sql = "SELECT * FROM `Post` WHERE `postId`=?";
    db.query(sql, postId, (err, rows) => {

        if (rows[0].User_userId === user || joinId === user) {
            const sql = 'DELETE FROM `JoinPost` WHERE `User_userId`=? and `Post_postId`=?'
            db.query(sql, [joinId, Number(postId)], (err, join) => {
                console.log(join.length === 0)
                if(join.length === 0) {
                    const sql = "INSERT INTO `JoinPost` (`User_userId`, `Post_postId`) VALUES (?,?)";
                    db.query(sql, [joinId, Number(postId)], (err, join) => {
                        res.send({ msg: 'success'}); 
                    })
                } else {
                    console.log("이미 추가됨")
                    res.send({ msg: 'fail'});
                }
            })
        } else {
            console.log("권한 없음")
            res.send({ msg: 'fail'});
        }

    });
});


// //게시글 삭제
// router.delete('/:postId', authMiddleware, (req, res, next) => {
//     const postId = req.params.postId;
//     const sql = 'DELETE FROM Post WHERE postId=?';

//     db.query(sql, postId, function (err, result) {
//         if (err) {
//             console.log(err);
//             res.status(201).send({ msg: 'fail' });
//         } else {
//             res.status(201).send({ msg: 'success' });
//         }
//     });
// });

// // 메인페이지 게시글 불러오기
// router.get('/postlist', (req, res) => {
//     const address = req.body.address.split(' ');
//     const fineAddr = address[0]+' '+address[1]+' '+address[2]

//     const addr = fineAddr +'%'
//     const sql = "SELECT * FROM Post WHERE address LIKE ? ORDER BY createdAt DESC"

//     db.query(sql, addr, (err, data) => {
//         if (err) console.log(err);
//         console.log(data);
//         res.status(201).send({ msg: 'success', data });
//     });
// });

// // 메인페이지 게시글 상세보기
// router.get('/postdetail', (req, res) => {
//     const postId = req.body.postId;
//     const sql = 'select * from Post where postId=?';

//     db.query(sql, postId, (err, data) => {
//         if (err) console.log(err);
//         res.status(201).send({ msg: 'success', data });
//     });
// });

// // 좋아요 생성 
// router.post('/like/:postId', authMiddleware, (req, res) => {
//     const user = res.locals;
//     const postId = req.params;
//     const sql = 'INSERT INTO `Like` (`Post_postId`,`User_userId`) VALUES (?,?)'

//     db.query(sql, [Number(postId.postId.toString()), user.user.userId], (err, data) => {
//         if(err) console.log(err)
//         res.status(201).send({msg:'success'});       
//     });
// });

// // 좋아요 삭제
// router.delete('/like/:postId', authMiddleware, (req, res) => {
//     const user = res.locals;
//     const postId = req.params;
//     const sql = 'DELETE FROM `Like` WHERE `Post_postId`=? and `User_userId`=?'

//     // console.log(user.user.userId, Number(postId.postId))
//     db.query(sql, [Number(postId.postId), user.user.userId], (err, data) => {
//         if(err) console.log(err)
//         res.status(201).send({msg:'success'});       
//     });
// })

module.exports = router;
