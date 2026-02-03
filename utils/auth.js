export const login = () => {
    return new Promise((resolve, reject) => {
        const app = getApp().globalData || getApp();
        const baseUrl = app.url;

        uni.showLoading({
            title: '登录中...'
        });

        uni.login({
            provider: 'weixin',
            success: (res) => {
                uni.request({
                    url: baseUrl + '/user/login',
                    data: {
                        "code": res.code
                    },
                    method: "GET",
                    success: (loginRes) => {
                        uni.hideLoading();
                        if (loginRes.data.code == 200) {
                            const resData = loginRes.data.data;
                            uni.setStorageSync('token', resData.token);
                            if (resData.adUnitId) {
                                uni.setStorageSync('adUnitId', resData.adUnitId);
                            }
                            resolve(resData);
                        } else {
                            uni.showToast({
                                title: loginRes.data.message || '登录失败',
                                icon: 'none'
                            });
                            reject(loginRes.data);
                        }
                    },
                    fail: () => {
                        uni.hideLoading();
                        uni.showToast({
                            title: '网络连接失败',
                            icon: 'none'
                        });
                        reject(new Error('网络连接失败'));
                    }
                });
            },
            fail: (err) => {
                uni.hideLoading();
                uni.showToast({
                    title: '微信登录失败',
                    icon: 'none'
                });
                reject(err);
            }
        });
    });
};
