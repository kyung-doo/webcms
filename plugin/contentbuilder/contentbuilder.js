

var ContentBuilder = ContentBuilder || (function ()
{
    /*
    *  드래그 이벤트
    */
    var DragEvent = {
        DRAG_START  : "dragStart",
        DRAG_MOVE   : "dragMove",
        DRAG_END    : "dragEnd"
    };


    /*
    *  블록 이벤트
    */
    var BlockEvent ={
        BLOCK_COPY : "blockCopy",
        BLOCK_DELETE : "blockDelete"
    }


    /*
    *  템플릿 카테고리
    */
    var tempCategory = [{name:"Default", id:0},{name:"All", id:-1},{name:"Title", id:1},{name:"Title, Subtitle", id:2},{name:"Info, Title", id:3},{name:"Heading, Paragraph", id:5},{name:"Paragraph", id:6},{name:"Buttons", id:33},{name:"Cards", id:34},{name:"Images + Caption", id:9},{name:"Images", id:11},{name:"Single Image", id:12},{name:"Call to Action", id:13},{name:"List", id:14},{name:"Quotes", id:15},{name:"Profile", id:16},{name:"Map", id:17},{name:"Video", id:20},{name:"Social", id:18},{name:"Services", id:21},{name:"Contact Info", id:22},{name:"Pricing", id:23},{name:"Team Profile", id:24},{name:"Products/Portfolio", id:25},{name:"How It Works", id:26},{name:"Partners/Clients", id:27},{name:"As Featured On", id:28},{name:"Achievements", id:29},{name:"Skills", id:32},{name:"Coming Soon", id:30},{name:"Page Not Found", id:31},{name:"Separator", id:19}];



    
    /*
    *  contentBlock 클래스
    */
    this.ContentBlock = EventDispatcher.extend(
    {
        container   : null,
        block       : null,
        tool        : null,        
        id          : null,
        isFocus     : false,

        // init
        init : function (container, block, id)
        {
            this.container = container;
            this.block = block;
            this.id = id;
            this.createTool();
            this.initEvent();
        },

        // 제거 
        dispos : function ()
        {
            this.block.unbind("focusin");
            this.block.unbind("focusout");
            this.block.remove();
        },

        // 이벤트 세팅
        initEvent : function ()
        {
            var owner = this;
            var tool
            owner.block.bind("focusin", function ()
            {
                $(this).addClass("ui-dragbox-outlined");
                owner.container.Editor("showMenuBar");
                owner.tool.css({display:"block"});
                owner.isFocus = true; 
            });
            owner.block.bind("focusout", function ()
            {
                owner.block.removeClass("ui-dragbox-outlined");
                owner.container.Editor("hideMenuBar");
                owner.tool.css({display:"none"});
                owner.isFocus = false;
            });
        },

        //툴바 생성
        createTool : function ()
        {
            var owner = this;
            owner.tool = $('<div class="block-tool">\
                              <div class="tool-btn move"><i class="fa fa-arrows"></i></div>\
                              <div class="tool-btn add"><i class="fa fa-plus"></i></div>\
                              <div class="tool-btn del" data-toggle="modal" data-target="#deleteModal'+owner.id+'"><i class="fa fa-trash-o"></i></div>\
                          </div>');

            owner.block.append(owner.tool);
            owner.tool.bind("mousedown", function (e)
            {
                e.stopPropagation();
                e.preventDefault();
            });

            owner.container.Editor("createModal", "deleteModal"+owner.id, "삭제", "삭제하시겠습니까?", function ()
            {
                owner.dispatchEvent({type:BlockEvent.BLOCK_DELETE, vars:{target:owner}});
                $("#deleteModal"+owner.id).modal("hide");
                
            }, "modal-sm");


            owner.tool.find(".add").bind("click", function ( e )
            {   
                owner.dispatchEvent({type:BlockEvent.BLOCK_COPY, vars:{target:owner}});
            });
        }

    });


    /*
    *  Dragger 클래스
    */
    this.Dragger = EventDispatcher.extend(
    {
        container    : null,
        dragObj      : null,
        dragPosition : {},
        dragTarget   : null,
        startPos     :  {},

        //init
        init : function ( container )
        {
            this.container = container;
            this.createObject();
            this.setDraggable();
        },

        //드래그 객체 생성
        createObject : function ()
        {
            var html = '<div class="drag_obj">\
                        </div>';
            this.dragObj = $(html);
            this.container.append(this.dragObj);

        },

        //드래그 타겟 마우스 이벤트
        setDraggable : function ()
        {
            
            var owner = this;
            var draggable = owner.container.find(".ui-draggable");
            
            draggable.each(function ( i )
            {
                $(this).unbind("mousedown", owner.dragStart);
                $(this).bind("mousedown", {owner:owner}, owner.dragStart);
            });
            
        },


        // 드래그 시작
        dragStart : function ( e )
        {
            var owner = e.data.owner;
            $(window).bind("mousemove", {owner:owner}, owner.dragMove);
            $(window).bind("mouseup", {owner:owner}, owner.dragEnd);
            owner.dragObj.addClass("drag");   
            owner.dragTarget = $(this);
            var pos = {left:e.pageX, top:e.pageY};
            owner.startPos = pos; 
            owner.dispatchEvent({type:DragEvent.DRAG_START, vars:{target:owner.dragTarget, position:pos}});
            owner.dragPosition = {x:pos.left - owner.dragTarget.offset().left, y:pos.top - owner.dragTarget.offset().top};
            owner.moveDragObject(owner.dragTarget, pos);
            e.preventDefault();
            e.stopPropagation();
        },

        // 드래그 이동
        dragMove : function ( e )
        {
            var owner = e.data.owner;
            var pos = {left:e.pageX, top:e.pageY};
            owner.moveDragObject(owner.dragTarget, pos);
            var area = owner.checkDragArea(owner.dragTarget, pos);
            var arrow;
            if(owner.startPos.top < pos.top)        arrow = 1;
            else if(owner.startPos.top > pos.top)   arrow = -1;
            else                                arrow = 0;
            owner.dispatchEvent({type:DragEvent.DRAG_MOVE, vars:{area:area, target:owner.dragTarget, position:pos, arrow:arrow}});
            owner.startPos = pos; 
            e.preventDefault();
            e.stopPropagation();
        },

        // 드래그 종료
        dragEnd : function ( e )
        {
            var owner = e.data.owner;
            $(window).unbind("mousemove", owner.dragMove);
            $(window).unbind("mouseup", owner.dragEnd);
            owner.dragObj.removeClass("drag");
            var pos = {left:e.pageX, top:e.pageY};
            var area = owner.checkDragArea(owner.dragTarget, pos);
            owner.dispatchEvent({type:DragEvent.DRAG_END, vars:{area:area, target:owner.dragTarget, position:pos}});
            owner.dragTarget = null;
            owner.dragObj.empty();
        },

        // 드래그 객체 이동
        moveDragObject : function ( target, position )
        {
            var winTop = $(window).scrollTop();
            this.dragObj.css({top:position.top - winTop - this.dragPosition.y, left:position.left - this.dragPosition.x});
        },

        // 드래그 영역 체크
        checkDragArea : function ( target, position )
        {
            var areas =  this.container.find(".ui-drag-area");
            for(var i=0; i<areas.length; i++)
            {
                var area = areas.eq(i);
                var rect = {
                    x:area.offset().left, 
                    y:area.offset().top, 
                    w:area.width()+parseInt(area.css("padding-left"))+parseInt(area.css("padding-right")), 
                    h:area.height()+parseInt(area.css("padding-top"))+parseInt(area.css("padding-bottom"))
                };

                if(area.is(".content_area")) rect.h = 112;
                if(position.left > rect.x && position.left < rect.x + rect.w && position.top > rect.y && position.top < rect.y + rect.h)
                {
                    return area;
                }
            }
            return null
        }

    });


    /*
    *  ContentBuilder 생성자
    */
    return Class.extend(
    {
        container     : null,
        contentArea   : null,
        tempTool      : null,
        tempFile      : null,
        tempSource    : null,
        dragger       : null,
        contentBlocks : [],
        contentCount  : 0,
        deleteModal   : null,


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

            var owner = this; 
            owner.contentArea = $('<div class="content_area"></div>');
            owner.container.append(owner.contentArea);
            owner.container.Editor();
            owner.initDragger();
            owner.initContentBlock();
            owner.createTempTool();

            // 드래그 생성
            
        },

        // 드래거 init
        initDragger : function ()
        {
            var owner = this;
            owner.dragger = new Dragger( owner.container );
            owner.dragger.addEventListener(DragEvent.DRAG_START, function ( e )
            {
                var target = e.vars.target;
                if(target.is(".ui-drag-list"))
                {
                    appendDragThumb(e.vars.target, e.vars.position);
                }
            });

            owner.dragger.addEventListener(DragEvent.DRAG_MOVE, function ( e )
            {
                if(e.vars.area)
                {
                    if(e.vars.area.is(".content_empty"))
                    {
                        $(".content_empty").css({"background-color":"rgba(0,0,0,0.01)"});  
                    }
                    else if(e.vars.area.is(".ui-drag-area"))
                    {
                        if(e.vars.arrow < 0)
                        {
                            e.vars.area.addClass("ui-add-up");
                            e.vars.area.removeClass("ui-add-down");
                        }
                        else if(e.vars.arrow < 1)
                        {
                            e.vars.area.removeClass("ui-add-up");
                            e.vars.area.addClass("ui-add-down");
                        }
                    }
                }
                else
                {
                    $(".content_empty").css({"background-color":""});
                    $(".ui-drag-block").removeClass("ui-add-up");
                    $(".ui-drag-block").removeClass("ui-add-down");
                }
            });

            owner.dragger.addEventListener(DragEvent.DRAG_END, function ( e )
            {
                var target = e.vars.target;
                if(target.is(".ui-drag-list"))
                {
                    target.find("img").css({opacity:""});
                }
                $(".content_empty").css({"background-color":""});

                if(e.vars.area)
                {
                    if(target.is(".ui-drag-list"))
                    {
                        if(e.vars.area.is(".content_empty"))
                        {
                            owner.createContentBlock(null, e.vars.target.attr("data-num"));
                            owner.contentArea.removeClass("content_empty").removeClass("ui-drag-area");
                            owner.dragger.setDraggable();
                        }
                        else if(e.vars.area.is(".ui-drag-area"))
                        {
                            owner.createContentBlock(e.vars.area, e.vars.target.attr("data-num"));
                        }
                    }
                }
                
                $(".ui-drag-block").removeClass("ui-add-up");
                $(".ui-drag-block").removeClass("ui-add-down");

            });

            // 드레그 이미지 추가
            function appendDragThumb( target, position )
            {
                var thumb = target.find("img").clone();
                target.find("img").css({opacity:0.8});
                owner.dragger.dragObj.append(thumb);
            }
        },

        // 콘텐츠 블록 init
        initContentBlock : function ()
        {
            var owner = this;
            var blocks = owner.contentArea.find(">div");

            if(blocks.length == 0)
            {
               owner.contentArea.addClass("content_empty").addClass("ui-drag-area"); 
            }
        },

        // 콘텐츠 블록 생성
        createContentBlock : function (target, dataNum, arrow)
        {
            var owner = this;
            var blockHtml = owner.findContentBlock( dataNum );
            
            if(blockHtml)
            {
                var block = $('<div id="content-block-'+owner.contentCount+'" class="ui-daggable ui-drag-block ui-drag-area" data-num="'+dataNum+'"></div>');
                if(target == null)
                {
                    owner.contentArea.append(block);
                }
                else
                {
                    if(target.is(".ui-add-up"))
                    {
                        target.before(block);
                    }
                    else if(target.is(".ui-add-down"))
                    {
                        target.after(block);
                    }
                }
                block.append(blockHtml);
                block.find(">div>div").attr("contenteditable", true);

                var contentBlock = new ContentBlock(owner.container, block, owner.contentCount);

                contentBlock.addEventListener(BlockEvent.BLOCK_COPY, function ( e )
                {
                    console.log("copy");
                });

                contentBlock.addEventListener(BlockEvent.BLOCK_DELETE, function ( e )
                {
                    
                   owner.deleteContentBlock(e.vars.target);
                });

                owner.contentBlocks.push( contentBlock );
                owner.contentCount++;
            }
        },

        // 콘텐츠 블록 삭제
        deleteContentBlock : function ( block )
        {
            var tempBlock = new Array();
            for(var i = 0; i<this.contentBlocks.length; i++)
            {
                var contentBlock = this.contentBlocks[i];
                if(block == contentBlock)
                {
                    contentBlock.dispos();
                    contentBlock.removeEventListener(BlockEvent.BLOCK_DELETE);
                    contentBlock.removeEventListener(BlockEvent.BLOCK_COPY);
                    contentBlock = null;
                }
                else
                {
                    tempBlock.push(contentBlock);
                }
            }
            this.contentBlocks = tempBlock;
            this.initContentBlock();
            this.container.Editor("hideMenuBar");
            this.dragger.setDraggable();
        },


        // 콘텐츠 블록 찾기
        findContentBlock : function ( dataNum )
        {
            var blocks = this.tempSource.find(">div").parent();
            for(var i = 0; i<blocks.length; i++)
            {
                var block = blocks.eq(i);
                if(block.attr("data-num") == dataNum)
                {
                    return block.html();
                }
            }
            return null;
        },


        // 템플릿툴 생성
        createTempTool : function ()
        {
            var owner = this;
            var tempHtml = '<div class="temp_tool show">\
                                <a class="button" href="javascript:"><i class="fa fa-chevron-right" aria-hidden="true"></i></a>\
                                <select class="temp_select form-control"></select>\
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

            owner.tempTool.bind("dragstart", function ( e )
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            owner.tempTool.bind("selectstart", function ( e )
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $(window).bind("resize", function ( e )
            {
                owner.tempTool.find(".temp_list").css({height:$(window).height()-80});
            });

            $(window).resize();
            owner.loadTemplate();

        },

        //템플릿 파일 로드
        loadTemplate : function ()
        {
            var owner = this;
            $.get(owner.tempFile, function ( data )
            {
                owner.tempSource = $(data);
                var list = owner.tempSource.find(">div").parent(); 
                list.each( function ( i )
                {
                    var imgPath = $(this).attr("data-thumb");
                    var dataNum = $(this).attr("data-num");
                    var dataCat = $(this).attr("data-cat");
                    var listHtml = '<div class="ui-draggable ui-drag-list" data-num="'+ dataNum +'" data-cat="'+ dataCat +'">\
                                        <img src="'+imgPath+'" />\
                                    </div>';
                    owner.tempTool.find(".temp_list").append(listHtml);
                });
                
                owner.setSelectBox();
                owner.sortTemplete(0);
                owner.dragger.setDraggable();
            });  
        }, 

        //카테고리 셀렉박스 세팅
        setSelectBox : function ()
        {
            var owner = this;

            for(var i=0; i<tempCategory.length; i++)
            {
                var item = tempCategory[i];
                var option = $('<option value="'+item.id+'">' + item.name + '</option>');
                owner.tempTool.find(".temp_select").append(option);
            }

            owner.tempTool.find(".temp_select").bind("change", function ( e )
            {
                var id = $(this).find("option:selected").val();
                owner.sortTemplete(id);
            });
        },

        // 카테고리 정렬
        sortTemplete : function ( id )
        {
            var owner = this;
            var list = owner.tempTool.find(".temp_list>div"); 
            list.each(function ( i )
            {
                if(id != -1)
                {
                    if($(this).attr("data-cat").indexOf(id) > -1)   $(this).css({display:"inline-block"});
                    else                                            $(this).css({display:"none"});
                }
                else
                {
                    $(this).css({display:"inline-block"});
                }
            });
        },

        // html 출력
        getHtml : function ()
        {

        }
    });
    
})();
