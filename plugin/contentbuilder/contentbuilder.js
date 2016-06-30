var ContentBuilder = ContentBuilder || (function ()
{

    /*
    *  contentBlock 클래스
    */
    this.ContentBlock = EventDispatcher.extend(
    {
        init : function ()
        {

        }
    });


    /*
    *  Dragger 클래스
    */
    this.Dragger = EventDispatcher.extend(
    {
        init : function ()
        {

        }
    });


    /*
    *  ContentBuilder 생성자
    */
    return Class.extend(
    {
        container:null,
        tempTool:null,
        tempFile : null,
        tempSource:null,


        // init
        init : function ( containerID, option )
        {
            this.container = $(containerID);
            
            var pattern = /tempFile/;

            for( var opt in option)
            {
                if(option[opt])
                {
                    if(pattern.test(opt)) this[opt] = option[opt];
                }
            }

            this.createTempTool();
        },

        // 템플릿툴 생성
        createTempTool : function ()
        {
            var owner = this;
            var tempHtml = '<div class="temp_tool show">\
                                <a class="button" href="javascript:"><i class="fa fa-chevron-right" aria-hidden="true"></i></a>\
                                <div class="temp_list"></div>\
                            </div>';
                            
            owner.tempTool = $(tempHtml);
            owner.container.append(owner.tempTool);
            owner.tempTool.find(".button").bind("click", function( e )
            {
               if(owner.tempTool.is(".hide"))
               {
                   owner.tempTool.removeClass("hide");
               } 
               else
               {
                   owner.tempTool.addClass("hide");
               }
            });

            owner.loadTemplate();

        },

        //템플릿 파일 로드
        loadTemplate : function ()
        {
            var owner = this;
            $.get(owner.tempFile, function ( data )
            {
                owner.tempSource = $(data);
                owner.tempSource.find(">div").each( function ( i )
                {
                    var imgPath = $(this).parent().attr("data-thumb");
                    var listHtml = '<div class="ui-draggable">\
                                        <img src="'+imgPath+'" />\
                                    </div>';
                    owner.tempTool.find(".temp_list").append(listHtml);
                });
                //console.log(data);
            }); 
        }
    });
    
})();
