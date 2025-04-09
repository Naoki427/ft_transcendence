import { checkAuthorization } from "/static/js/utils/authJWT.js";
import { translations_format } from "/static/js/utils/translations.js";

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 認証チェック
        await checkAuthorization();
        
        console.log('Setting page loaded, checking language settings...');
        
        // デフォルト画像を設定（最初に行う）
        const profileImagePreview = document.getElementById('profile-image-preview');
        if (profileImagePreview) {
            // 画像の読み込みエラー時の処理を追加
            profileImagePreview.onerror = function() {
                console.log('Failed to load profile image, using inline SVG fallback');
                this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%2334495e%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23fff%22%20font-family%3D%22Arial%22%20font-size%3D%2224%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EUser%3C%2Ftext%3E%3C%2Fsvg%3E';
                this.onerror = null; // 無限ループを防止
            };
            
            // 絶対URLでデフォルト画像を設定
            profileImagePreview.src = window.location.origin + '/media/profile_images/default.png';
            console.log('Set default profile image URL:', profileImagePreview.src);
        }
        
        // 言語設定を取得
        const storedLang = localStorage.getItem("language");
        console.log('Stored language value:', storedLang);
        
        const lang = parseInt(storedLang, 10) || 0;
        console.log('Parsed language value:', lang);
        
        // 言語選択の初期値を設定
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            console.log('Setting language select value to:', lang);
            languageSelect.value = lang.toString();
        } else {
            console.error('Language select element not found');
        }
        
        const translations = translations_format[lang];
        console.log('Using translations for language:', lang);
        
        // 翻訳を適用
        applyTranslations(translations);
        
        // ユーザー情報を取得
        await fetchUserInfo();
        
        // イベントリスナーを設定
        setupEventListeners();
        
        // ローディング画面を非表示
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'block';
        }
    } catch (error) {
        console.error('Error initializing settings page:', error);
    }
});

// 翻訳を適用する関数
function applyTranslations(translations) {
    // 要素が存在する場合のみ翻訳を適用するヘルパー関数
    const setTextIfExists = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    };
    
    // 各要素に翻訳を適用
    setTextIfExists('title', `ft_transcendence - ${translations.setting}`);
    setTextIfExists('loading-text', translations.loading);
    setTextIfExists('settings-title', translations.setting);
    setTextIfExists('profile-settings-title', translations.profileSettings);
    setTextIfExists('username-label', translations.username);
    setTextIfExists('profile-image-label', translations.profileImage);
    setTextIfExists('save-profile-btn', translations.saveProfile);
    setTextIfExists('language-settings-title', translations.languageSettings);
    setTextIfExists('language-label', translations.language);
    setTextIfExists('account-settings-title', translations.accountSettings);
    setTextIfExists('2fa-label', translations.twoFactorAuth);
    setTextIfExists('back-btn', translations.backToHome);
    
    // 2FAのステータステキストを更新
    const statusElement = document.getElementById('2fa-status');
    if (statusElement) {
        const twoFAEnabled = document.getElementById('2fa-toggle')?.checked || false;
        statusElement.textContent = twoFAEnabled ? translations.enabled : translations.disabled;
    }
}

// ユーザー情報を取得する関数
async function fetchUserInfo() {
    try {
        const response = await fetch('/api/get_user_info/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            // ユーザー名を設定
            document.getElementById('username').value = userData.username;
            
            // プロフィール画像を設定
            if (userData.profile_image_url && userData.profile_image_url !== 'media/profile_images/default.png') {
                console.log('Custom profile image URL found:', userData.profile_image_url);
                // プロフィール画像のURLをローカルストレージに保存
                localStorage.setItem('profile_image_url', userData.profile_image_url);
                
                // URLが絶対URLの場合は相対URLに変換
                let imageUrl = userData.profile_image_url;
                if (imageUrl.startsWith('http')) {
                    // URLからパス部分だけを取得
                    try {
                        const urlObj = new URL(imageUrl);
                        imageUrl = urlObj.pathname;
                    } catch (e) {
                        console.error('Invalid URL:', imageUrl);
                    }
                }
                
                document.getElementById('profile-image-preview').src = imageUrl;
                console.log('Set custom profile image:', imageUrl);
            } else {
                // ローカルストレージに保存されたカスタムプロフィール画像があれば使用
                const storedImageUrl = localStorage.getItem('profile_image_url');
                if (storedImageUrl && storedImageUrl !== 'media/profile_images/default.png') {
                    console.log('Using stored custom profile image URL:', storedImageUrl);
                    
                    // URLが絶対URLの場合は相対URLに変換
                    let imageUrl = storedImageUrl;
                    if (imageUrl.startsWith('http')) {
                        // URLからパス部分だけを取得
                        try {
                            const urlObj = new URL(imageUrl);
                            imageUrl = urlObj.pathname;
                        } catch (e) {
                            console.error('Invalid URL:', imageUrl);
                        }
                    }
                    
                    document.getElementById('profile-image-preview').src = imageUrl;
                    console.log('Set stored custom profile image:', imageUrl);
                } else {
                    console.log('No custom profile image found, default image will be used');
                    // デフォルト画像はそのまま使用する
                }
            }
            
            // 2FA状態を設定
            const twoFAEnabled = userData.two_factor_enabled || false;
            document.getElementById('2fa-toggle').checked = twoFAEnabled;
            document.getElementById('2fa-status').textContent = twoFAEnabled ? 
                translations_format[parseInt(localStorage.getItem("language"), 10) || 0].enabled : 
                translations_format[parseInt(localStorage.getItem("language"), 10) || 0].disabled;
            
            if (twoFAEnabled) {
                document.getElementById('2fa-status').style.color = '#0f0';
            } else {
                document.getElementById('2fa-status').style.color = '#f00';
            }
        } else {
            console.error('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

// イベントリスナーを設定する関数
function setupEventListeners() {
    // プロフィール画像のプレビュー
    document.getElementById('profile-image').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-image-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // プロフィール保存
    document.getElementById('profile-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const profileImage = document.getElementById('profile-image').files[0];
        
        // フォームデータを作成
        const formData = new FormData();
        formData.append('username', username);
        if (profileImage) {
            formData.append('profile_image', profileImage);
        }
        
        // 保存ボタンを無効化して処理中であることを示す
        const saveButton = document.getElementById('save-profile-btn');
        const originalText = saveButton.textContent;
        const currentLang = parseInt(localStorage.getItem("language"), 10) || 0;
        saveButton.textContent = translations_format[currentLang].loading;
        saveButton.disabled = true;
        
        try {
            // プロフィール更新APIを呼び出す
            console.log('プロフィール更新を実行:', formData);
            
            const response = await fetch('/api/user/update/', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            if (response.ok) {
                // レスポンスのJSONを取得
                const responseData = await response.json();
                
                // プロフィール画像が更新された場合、ローカルストレージを更新
                if (formData.has('profile_image')) {
                    // フォームデータにプロフィール画像が含まれている場合
                    const profileImageUrl = responseData.profile_image_url || responseData.data?.profile_image_url;
                    if (profileImageUrl) {
                        console.log('Updating stored profile image URL:', profileImageUrl);
                        localStorage.setItem('profile_image_url', profileImageUrl);
                        
                        // URLが絶対URLの場合は相対URLに変換
                        let imageUrl = profileImageUrl;
                        if (imageUrl.startsWith('http')) {
                            try {
                                const urlObj = new URL(imageUrl);
                                imageUrl = urlObj.pathname;
                            } catch (e) {
                                console.error('Invalid URL:', imageUrl);
                            }
                        }
                        
                        // プレビュー画像を更新
                        document.getElementById('profile-image-preview').src = imageUrl;
                    }
                }
                
                // 成功メッセージを表示
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = translations_format[currentLang].profileUpdated;
                successMsg.style.position = 'fixed';
                successMsg.style.top = '20px';
                successMsg.style.left = '50%';
                successMsg.style.transform = 'translateX(-50%)';
                successMsg.style.zIndex = '1000';
                successMsg.style.padding = '10px 20px';
                successMsg.style.borderRadius = '5px';
                successMsg.style.backgroundColor = '#4CAF50';
                successMsg.style.color = 'white';
                document.body.appendChild(successMsg);
                
                // 3秒後にメッセージを消す
                setTimeout(() => {
                    document.body.removeChild(successMsg);
                }, 3000);
                
                // ユーザー情報を再取得して表示を更新
                await fetchUserInfo();
            } else {
                // エラーメッセージを表示
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger';
                errorMsg.textContent = translations_format[currentLang].updateFailed;
                errorMsg.style.position = 'fixed';
                errorMsg.style.top = '20px';
                errorMsg.style.left = '50%';
                errorMsg.style.transform = 'translateX(-50%)';
                errorMsg.style.zIndex = '1000';
                errorMsg.style.padding = '10px 20px';
                errorMsg.style.borderRadius = '5px';
                errorMsg.style.backgroundColor = '#f44336';
                errorMsg.style.color = 'white';
                document.body.appendChild(errorMsg);
                
                // 3秒後にメッセージを消す
                setTimeout(() => {
                    document.body.removeChild(errorMsg);
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            // エラーメッセージを表示
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-danger';
            errorMsg.textContent = translations_format[currentLang].updateFailed;
            errorMsg.style.position = 'fixed';
            errorMsg.style.top = '20px';
            errorMsg.style.left = '50%';
            errorMsg.style.transform = 'translateX(-50%)';
            errorMsg.style.zIndex = '1000';
            errorMsg.style.padding = '10px 20px';
            errorMsg.style.borderRadius = '5px';
            errorMsg.style.backgroundColor = '#f44336';
            errorMsg.style.color = 'white';
            document.body.appendChild(errorMsg);
            
            // 3秒後にメッセージを消す
            setTimeout(() => {
                document.body.removeChild(errorMsg);
            }, 3000);
        } finally {
            // ボタンを元に戻す
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }
    });
    
    // 言語変更
    document.getElementById('language')?.addEventListener('change', function(event) {
        try {
            console.log('Language changed, new value:', event.target.value);
            const selectedLang = parseInt(event.target.value, 10);
            localStorage.setItem('language', selectedLang.toString());
            console.log('Language saved to localStorage:', selectedLang);
            
            // 選択された言語の翻訳を取得
            const newTranslations = translations_format[selectedLang];
            if (!newTranslations) {
                console.error('Translations not found for language:', selectedLang);
                return;
            }
            
            // 翻訳を適用
            applyTranslations(newTranslations);
            
            // 2FA状態のテキストを更新
            const statusElement = document.getElementById('2fa-status');
            const toggleElement = document.getElementById('2fa-toggle');
            
            if (statusElement && toggleElement) {
                const twoFAEnabled = toggleElement.checked;
                statusElement.textContent = twoFAEnabled ? 
                    newTranslations.enabled : 
                    newTranslations.disabled;
            }
            
            // 言語変更の成功メッセージを表示
            if (newTranslations.languageChanged) {
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = newTranslations.languageChanged;
                successMsg.style.position = 'fixed';
                successMsg.style.top = '20px';
                successMsg.style.left = '50%';
                successMsg.style.transform = 'translateX(-50%)';
                successMsg.style.zIndex = '1000';
                successMsg.style.padding = '10px 20px';
                successMsg.style.borderRadius = '5px';
                successMsg.style.backgroundColor = '#4CAF50';
                successMsg.style.color = 'white';
                document.body.appendChild(successMsg);
                
                // 3秒後にメッセージを消す
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Error changing language:', error);
        }
    });
    
    // 2FA切り替え
    const twoFAToggle = document.getElementById('2fa-toggle');
    if (twoFAToggle) {
        twoFAToggle.addEventListener('change', async function(event) {
            // トグルの状態を保存
            const enabled = event.target.checked;
            // トグルを一時的に無効化してユーザー操作を防止
            twoFAToggle.disabled = true;
            
            try {
                console.log('Toggling 2FA to:', enabled);
                
                // 2FAトグルのAPIを呼び出す
                const response = await fetch('/api/user/2fa/toggle/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ enable: enabled }),
                    credentials: 'include'
                });
                
                const lang = parseInt(localStorage.getItem("language"), 10) || 0;
                const statusElement = document.getElementById('2fa-status');
                
                if (response.ok) {
                    console.log('2FA toggle successful, status:', response.status);
                    
                    if (statusElement) {
                        statusElement.textContent = enabled ? 
                            translations_format[lang].enabled : 
                            translations_format[lang].disabled;
                        
                        statusElement.style.color = enabled ? '#0f0' : '#f00';
                    }
                    
                    // 2FAが有効化された場合、QRコードを表示するページに遷移
                    if (enabled && response.status === 201) {
                        window.location.href = '/pages/qr/';
                        return; // ページ遷移後は処理を終了
                    }
                    
                    // 成功メッセージを表示
                    const successMsg = document.createElement('div');
                    successMsg.className = 'alert alert-success';
                    successMsg.textContent = enabled ? 
                        translations_format[lang].twoFactorEnabled : 
                        translations_format[lang].twoFactorDisabled;
                    successMsg.style.position = 'fixed';
                    successMsg.style.top = '20px';
                    successMsg.style.left = '50%';
                    successMsg.style.transform = 'translateX(-50%)';
                    successMsg.style.zIndex = '1000';
                    successMsg.style.padding = '10px 20px';
                    successMsg.style.borderRadius = '5px';
                    successMsg.style.backgroundColor = '#4CAF50';
                    successMsg.style.color = 'white';
                    document.body.appendChild(successMsg);
                    
                    // 3秒後にメッセージを消す
                    setTimeout(() => {
                        if (document.body.contains(successMsg)) {
                            document.body.removeChild(successMsg);
                        }
                    }, 3000);
                } else {
                    console.error('Failed to toggle 2FA, status:', response.status);
                    // 失敗した場合は元の状態に戻す
                    event.target.checked = !enabled;
                    
                    if (statusElement) {
                        statusElement.textContent = !enabled ? 
                            translations_format[lang].enabled : 
                            translations_format[lang].disabled;
                        
                        statusElement.style.color = !enabled ? '#0f0' : '#f00';
                    }
                    
                    // エラーメッセージを表示
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'alert alert-danger';
                    errorMsg.textContent = translations_format[lang].updateFailed;
                    errorMsg.style.position = 'fixed';
                    errorMsg.style.top = '20px';
                    errorMsg.style.left = '50%';
                    errorMsg.style.transform = 'translateX(-50%)';
                    errorMsg.style.zIndex = '1000';
                    errorMsg.style.padding = '10px 20px';
                    errorMsg.style.borderRadius = '5px';
                    errorMsg.style.backgroundColor = '#f44336';
                    errorMsg.style.color = 'white';
                    document.body.appendChild(errorMsg);
                    
                    // 3秒後にメッセージを消す
                    setTimeout(() => {
                        if (document.body.contains(errorMsg)) {
                            document.body.removeChild(errorMsg);
                        }
                    }, 3000);
                }
            } catch (error) {
                console.error('Error toggling 2FA:', error);
                // 失敗した場合は元の状態に戻す
                event.target.checked = !enabled;
                
                const statusElement = document.getElementById('2fa-status');
                if (statusElement) {
                    const lang = parseInt(localStorage.getItem("language"), 10) || 0;
                    statusElement.textContent = !enabled ? 
                        translations_format[lang].enabled : 
                        translations_format[lang].disabled;
                    
                    statusElement.style.color = !enabled ? '#0f0' : '#f00';
                }
                
                // エラーメッセージを表示
                const lang = parseInt(localStorage.getItem("language"), 10) || 0;
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger';
                errorMsg.textContent = translations_format[lang].updateFailed;
                errorMsg.style.position = 'fixed';
                errorMsg.style.top = '20px';
                errorMsg.style.left = '50%';
                errorMsg.style.transform = 'translateX(-50%)';
                errorMsg.style.zIndex = '1000';
                errorMsg.style.padding = '10px 20px';
                errorMsg.style.borderRadius = '5px';
                errorMsg.style.backgroundColor = '#f44336';
                errorMsg.style.color = 'white';
                document.body.appendChild(errorMsg);
                
                // 3秒後にメッセージを消す
                setTimeout(() => {
                    if (document.body.contains(errorMsg)) {
                        document.body.removeChild(errorMsg);
                    }
                }, 3000);
            } finally {
                // 処理が終わったらトグルを再度有効化
                twoFAToggle.disabled = false;
            }
        });
    } else {
        console.error('2FA toggle element not found');
    }
    
    // ホームに戻るボタン
    document.getElementById('back-btn').addEventListener('click', function() {
        window.location.href = '/pages/home/';
    });
}
