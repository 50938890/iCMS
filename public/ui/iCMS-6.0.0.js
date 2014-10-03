(function($) {
    iCMS.user = {
            data:{},
            data: function(param) {
                $.get(iCMS.api('user', '&do=data'), param, function(c) {
                    //if(!c.code) return false;
                    iCMS.user.data = c;
                    var user_home = $(".iCMS_user_home")
                    user_home.attr("href", c.url);
                    $(".avatar", user_home).attr("src", c.avatar);
                    $(".name", user_home).text(c.nickname);
                }, 'json');
            },
            logout: function() {
                $.get(iCMS.api('user', "&do=logout"), function(c) {
                    window.location.href = c.forward
                }, 'json');
            },
            status: function() {
                return iCMS.getcookie(iCMS.config.AUTH) ? true : false;
            },
            ucard:function(){
              $("[data-tip^='iCMS:ucard']").poshytip({
                className: 'iCMS_tooltip',
                alignTo: 'target',alignX: 'center',
                offsetX: 0,offsetY: 5,
                fade: false,slide: false,
                content: function(updateCallback) {
                    $.get(iCMS.api('user', "&do=ucard"),
                        {'uid': $(this).attr('data-tip').replace('iCMS:ucard:','')},
                      function(html) {
                        updateCallback(html);
                    });
                    return '<div class="tip_info"><img src="'+iCMS.config.PUBLIC+'/ui/img/lightgray-loading.gif"><span> 用户信息加载中……</span></div>';
                }
              });
            },
            follow: function(a) {
                var $this = $(a),
                    param = iCMS.param($this);
                    //console.log(param);
                $.post(iCMS.api('user', "&do=follow"), param, function(c) {
                    if (c.code) {
                        param['follow'] = (param['follow']=='1'?'0':'1');
                        iCMS.param($this,param);
                        $this.removeClass((param['follow']=='1'? 'follow' : 'unfollow'));
                        $this.addClass((param['follow']=='1' ? 'unfollow' : 'follow'));
                    } else {
                        iCMS.alert(c.msg);
                        return false;
                    }
                    // window.location.href = c.forward
                }, 'json');
            }
    };
    iCMS.article = {
            good: function(a) {
                var $this = $(a),
                    p = $this.parent(),
                    param = iCMS.param(p);
                param['do'] = 'good';
                $.get(iCMS.api('article'), param, function(c) {
                    iCMS.alert(c.msg, c.code);
                    if (c.code) {
                        var count = parseInt($('span', $this).text());
                        $('span', $this).text(count + 1);
                    } else {
                        return false;
                    }
                }, 'json');
            }
    };
    var _iCMS = {
        report:function(a) {
            var $this = $(a),
                report_box = document.getElementById("iCMS-report-box"),
                report_modal = $this.modal({
                    title: '为什么举报这个评论?',
                    width: "460px",
                    html: report_box,
                    scroll: true
                });
            $("li", report_box).click(function(event) {
                $("li", report_box).removeClass('checked');
                $(this).addClass('checked');
            });
            $('[name="cancel"]', report_box).click(function(event) {
                report_modal.destroy();
            });
            $('[name="ok"]', report_box).click(function(event) {
                event.preventDefault();
                var report_param = iCMS.param($this),
                content = $("[name='content']", report_box);
                report_param['reason'] = $("[name='reason']:checked", report_box).val();
                if (!report_param['reason']) {
                    iCMS.alert("请选择举报的原因");
                    return false;
                }
                if (report_param['reason'] == "0") {
                    report_param['content'] = content.val();
                    if (!report_param['content']) {
                        iCMS.alert("请填写举报的原因");
                        return false;
                    }
                }
                report_param.action = 'report';
                $.post(iCMS.api('user'), report_param, function(c) {
                    content.val('');
                    iCMS.alert(c.msg,c.code);
                    $("li", report_box).removeClass('checked');
                    $("[name='reason']", report_box).removeAttr('checked');
                    if(c.code){
                        report_modal.destroy();
                    }
                }, 'json');
            });
        },

        param: function(a,_param) {
            if(_param){
                a.attr('data-param',iCMS.json2str(_param));
                return;
            }
            var param = a.attr('data-param') || false;
            if (!param) return {};
            return $.parseJSON(param);
        },
        api: function(app, _do) {
            return iCMS.config.API + '?app=' + app + (_do || '');
        },

        run: function() {
            var doc = $(document);
            this.user.ucard();
            this.user_status = this.user.status();
            if (this.user_status) {
                this.user.data();
                $("#iCMS-nav-login").hide();
                $("#iCMS-nav-profile").show();
                this.hover(".iCMS_user_home",20,-10);
            }
            doc.on("click", '.iCMS_user_follow', function(event) {
                event.preventDefault();
                if (!iCMS.user_status) {
                    iCMS.LoginBox();
                    return false;
                }
                iCMS.user.follow(this);
                return false;
            });
            doc.on("click", '.iCMS_article_do', function(event) {
                event.preventDefault();
                if (!iCMS.user_status) {
                    iCMS.LoginBox();
                    return false;
                }
                var param = iCMS.param($(this));
                if (param.do =='comment') {
                    iCMS.comment.box(this);
                } else if (param.do =='good') {
                    iCMS.article.good(this);
                }
                return false;
            });
            doc.on("click", '.iCMS_user_logout', function(event) {
                event.preventDefault();
                iCMS.user.logout();
                return false;
            });
            doc.on("click", '.iCMS_user_login', function(event) {
                event.preventDefault();
                iCMS.LoginBox();
                return false;
            });
            doc.on('click', 'a[name="iCMS-report"]', function(event) {
                event.preventDefault();
                if (!iCMS.user_status) {
                    iCMS.LoginBox();
                    return false;
                }
                window.top.iCMS.report(this);
            });
            $(".iCMS_seccode_img,.iCMS_seccode_text").click(function() {
                $(".iCMS_seccode_img").attr('src', iCMS.api('public', '&do=seccode&') + Math.random());
            });
            $(".iCMS_API_iframe").load(function() {
                iCMS.api_iframe_height($(this));
            });
            $('.tip').tooltip();
        },
        api_iframe_height:function(a,b){
            var a = a||window.top.$(b);
            a.height(0); //用于每次刷新时控制IFRAME高度初始化
            var height = a.contents().height();
            a.height(height);
            //window.top.$('.iCMS_API_iframe-loading').hide();
        },
        LoginBox: function() {
            var dialog = window.top.document.getElementById("iCMS-login-dialog");
            iCMS_Login_MODAL = window.top.$(this).modal({
                width: "560px",
                html: dialog,
                scroll: true
            });

            this.user.login("#iCMS-login-dialog");
        },
        hover: function(a, t, l) {
            var timeOutID = null,t = t || 0, l = l || 0,
            b = $(a).parent().find('.popover');
            $(a).hover(function() {
                var position = $(this).position();
                $(b).show().css({
                    top: position.top + t,
                    left: position.left + l
                });
            }, function() {
                timeOutID = setTimeout(function() {
                    $(b).hide();
                }, 2500);
            });
            $(b).hover(function() {
                window.clearTimeout(timeOutID);
                $(this).show();
            }, function() {
                $(this).hide();
            });
        },
        modal: function() {
            $('[data-toggle="modal"]').on("click", function(event) {
                event.preventDefault();
                window.top.iCMS_MODAL = $(this).modal({
                    width: "85%",
                    height: "640px"
                });
                //$(this).parent().parent().parent().removeClass("open");
                return false;
            });
        },
    };
    iCMS = $.extend(iCMS,_iCMS);//扩展 or 替换 iCMS属性
})(jQuery);
