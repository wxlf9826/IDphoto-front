/**
 * 制作证件照接口封装
 * @param {String} filePath - 本地图片路径
 * @param {Object} data - 配置参数对象
 */
export const createPhotoApi = (filePath, data) => {
    // 动态获取 App.vue 中定义的 globalData
    const app = getApp();
    const BASE_URL = app.globalData.url;

    console.log('API 调用路径:', BASE_URL + '/photo/create');
    console.log('待上传文件:', filePath);
    console.log('formData 参数:', JSON.stringify({
        'data': JSON.stringify(data)
    }, null, 2));

    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: BASE_URL + '/photo/create', // 拼接后端接口路径
            header: {
                'token': uni.getStorageSync('token')
            },
            filePath: filePath,
            name: 'file', // 对应后端 @RequestPart("file")
            formData: {
                // 对应后端 @RequestPart("data")，转为 JSON 字符串发送
                'data': JSON.stringify(data)
            },
            success: (uploadRes) => {
                // uni.uploadFile 返回的是 String，需要解析
                try {
                    const res = JSON.parse(uploadRes.data);
                    // 根据你后端的 ResponseResult 结构判断 code
                    if (res.code === 200) {
                        resolve(res);
                    } else {
                        reject(res);
                    }
                } catch (e) {
                    reject({
                        code: 500,
                        message: '解析异常'
                    });
                }
            },
            fail: (err) => {
                console.error('上传失败:', err);
                reject({
                    code: -1,
                    message: '网络连接失败: ' + (err.errMsg || JSON.stringify(err))
                });
            }
        });
    });
};


/**
 * 观看广告奖励积分
 */
export const rewardPointsApi = () => {
    const app = getApp();
    const BASE_URL = app.globalData.url;

    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + '/user/point/reward',
            method: 'POST',
            header: {
                'token': uni.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: (err) => {
                reject({
                    code: -1,
                    message: '网络连接失败'
                });
            }
        });
    });
};

/**
 * 获取用户信息（包含积分）
 */
export const getUserInfoApi = () => {
    const app = getApp();
    const BASE_URL = app.globalData.url;

    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + '/user/info',
            method: 'GET',
            header: {
                'token': uni.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code === 200) {
                    resolve(res.data.data);
                } else {
                    reject(res.data);
                }
            },
            fail: (err) => {
                reject({
                    code: -1,
                    message: '网络连接失败'
                });
            }
        });
    });
};
