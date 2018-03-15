// JavaScript Document
(function(window) {
	$(function() {
		var dataGrid = function(ele, opt) {
			this.defaults = {
				//id
				id: "",
				//请求url
				url: null,
				//表头格式
				columns: null,
				//是否分页
				pagination: false,
				//是否隔行变色
				isoddcolor: false,
				//是否搜索栏
				searchnation: false,
				//分页列表
				pagesizelist: [6, 12],
				//页显示
				pagesize: 5,
				//页索引
				pageindex: 1,
				//总页数
				totalpage: null,
				//排序
				sort: false
			}
			this.settings = $.extend({}, this.defaults, opt);
		}

		dataGrid.prototype = {
			_id: null,
			_op: null,
			init: function() {
				this._id = this.settings.id;
				_op = this;
				this.create();
				this.bindEvent();
			},
			create: function() {
				//初始化元素
				this.InitializeElement();
				//初始化表头
				this.createTableHead();
				//初始化动态行
				this.createTableBody(1);
				//初始化搜索框
				//if(this.settings.searchnation) this.createsearchbox();
				//选择是否分页
				if(this.settings.pagination) this.createTableFoot();
			},
			bindEvent: function() {
				//添加上一页事件
				this.registerUpPage();
				//添加下一页事件
				this.registerNextPage();
				//添加首页事件
				this.registerFirstPage();
				//添加最后一页事件
				this.registerlastPage();
				//添加跳转事件
				this.registerSkipPage();
				//添加鼠标悬浮事件
				this.registermousehover();
				//添加隔行变色
				this.registerchangebgcolor();
				//添加全选全不选事件
				//this.registercheckall();
				//添加表头点击事件
				this.registerThEvent();
				//绑定回车事件  用户输入页码框聚焦的时候 执行页面跳转事件
				this.enterForPageEvent();
				//绑定分页列表选择事件
				this.registerPageSelectEvent();
			},
			//初始化元素
			InitializeElement: function() {
				//var id = this.settings.id;
				$("#" + this._id).empty().append("<thead><tr></tr></thead><tbody></tbody><TFOOT></TFOOT>");
			},
			//循环添加表头
			createTableHead: function() {
				var headcols = this.settings.columns;
				for(var i = 0; i < headcols.length; i++) {
					if(headcols[i].field == 'ck') {
						if(headcols[i].show == true) {
							$("table[id='" + this._id + "'] thead tr").append("<th width=" + headcols[i].width + " align=" + headcols[i].align + "><input name='chkall' type='checkbox'></th>");
						}
					} else if(headcols[i].field == 'handle') {
						if(headcols[i].show == true) {
							$("table[id='" + this._id + "'] thead tr").append("<th width=" + headcols[i].width + " align=" + headcols[i].align + ">" + headcols[i].title + "</th>");
						}
					} else {
						$("table[id='" + this._id + "'] thead tr").append("<th width=" + headcols[i].width + " align=" + headcols[i].align + ">" + headcols[i].title + "</th>");
					}
				}
			},
			//循环添加行
			createTableBody: function(pn) {
				var columns = _op.settings.columns;
				var json = this.getAjaxDate(_op.settings.url, null);
				//总页数=向上取整(总数/每页数)
				_op.settings.totalpage = Math.ceil((json.total) / _op.settings.pagesize);
				//开始页数
				var startPage = _op.settings.pagesize * (pn - 1);
				//结束页数
				var endPage = startPage + _op.settings.pagesize;
				var rowsdata = "";
				for(var row = startPage; row < endPage; row++) {
					if(row == json.rows.length) break;
					rowsdata += "<tr>";
					for(var colindex = 0; colindex < columns.length; colindex++) {
						if(columns[colindex].field == 'ck') {
							if(columns[colindex].show == true) {
								rowsdata += '<td width="' + columns[colindex].width + '" align="' + columns[colindex].align + '"><input name="chk" type="checkbox"></td>'
							}
						} else if(columns[colindex].field == 'handle') {
							if(columns[colindex].show == true) {
								rowsdata += '<td width="' + columns[colindex].width + '" align="' + columns[colindex].align + '" class="action"><s>查看</s><s>编辑</s><s>删除</s></td>';
							}
						} else {
							rowsdata += '<td width=' + columns[colindex].width + ' align=' + columns[colindex].align + '>' + json.rows[row][columns[colindex].field] + '</td>';
						}

					}
					rowsdata += "</tr>";
				}
				$("table[id='" + this._id + "'] tbody").empty().append(rowsdata);
				$("#currentpageIndex").html(pn);
				this.registermousehover();
			},
			//初始化分页
			createTableFoot: function() {
				var footHtml = "<tr><td align='center'>";
				footHtml += "<select id='pagesizelist'></select>";
				footHtml += "<span id='firstPage'>首页</span>";
				footHtml += "<span id='UpPage'>上一页</span>";
				footHtml += "<span id='nextPage'>下一页</span>";
				footHtml += "<span id='lastPage'>末页</span>";
				footHtml += "<input type='text'/><span id='skippage'>跳转</span>";
				footHtml += "<span id='countPage'>第<font id='currentpageIndex'>1</font>/" + _op.settings.totalpage + "页</span>";
				footHtml += "</td></tr>";
				$("table[id='" + this._id + "'] tfoot").append(footHtml);
				$("table[id='" + this._id + "'] tfoot tr td").attr("colspan", $("table[id='" + this._id + "'] thead th").length);
				//初始化分页列表
				$.each(this.settings.pagesizelist, function(i, e) {
					if(e == _op.settings.pagesize) {
						$('#pagesizelist').append('<option selected="seleted">' + e + '</option>')
					} else {
						$('#pagesizelist').append('<option>' + e + '</option>');
					}
				});
			},
			//添加鼠标悬浮事件
			registermousehover: function() {
				//添加鼠标悬浮事件
				$("table[id='" + this._id + "'] tbody tr").mouseover(function() {
					$(this).addClass("mouseover");
				}).mouseleave(function() {
					$(this).removeClass("mouseover");
				});
			},
			//添加隔行变色事件
			registerchangebgcolor: function() {
				//添加隔行变色
				if(this.settings.isoddcolor) $("table[id='" + this._id + "'] tr:odd").css("background-color", "#A77C7B").css("color", "#fff");
			},
			//添加全选全不选事件
			registercheckall: function() {
				//添加全选全不选事件
				$("input[name='chkall']").click(function() {
					if(this.checked) {
						$("input[name='chk']").each(function() {
							$(this).prop("checked", true);
						});
					} else {
						$("input[name='chk']").each(function() {
							$(this).prop("checked", false);
						});
					}
				});
			},
			//添加首页事件
			registerFirstPage: function() {
				$("#firstPage").click(function() {
					_op.settings.pageindex = 1;
					_op.createTableBody(_op.settings.pageindex);
				});
			},
			//添加上一页事件
			registerUpPage: function() {
				$("table[id='" + this._id + "']").delegate("#UpPage", "click",
					function() {
						if(_op.settings.pageindex == 1) {
							alert("已经是第一页了");
							return;
						}
						_op.settings.pageindex = _op.settings.pageindex - 1;
						_op.createTableBody(_op.settings.pageindex);
					});
			},
			//添加下一页事件
			registerNextPage: function() {
				$("table[id='" + this._id + "']").delegate("#nextPage", "click",
					function() {
						if(_op.settings.pageindex == _op.settings.totalpage) {
							alert("已经是最后一页了");
							return;
						}
						_op.settings.pageindex = _op.settings.pageindex + 1;
						_op.createTableBody(_op.settings.pageindex);
					});
			},
			//添加尾页事件
			registerlastPage: function() {
				$("table[id='" + this._id + "']").delegate("#lastPage", "click",
					function() {
						_op.settings.pageindex = _op.settings.totalpage;
						_op.createTableBody(_op.settings.totalpage);
					});
			},
			//添加页数跳转事件
			registerSkipPage: function() {
				$("table[id='" + this._id + "']").delegate("#skippage", "click",
					function() {
						var value = $("table[id='" + _op._id + "'] tfoot tr td input").val();
						if(!isNaN(parseInt(value))) {
							if(parseInt(value) <= _op.settings.totalpage) _op.createTableBody(parseInt(value));
							else alert("超出页总数");
						} else alert("请输入数字");
					});
			},
			//添加分页列表选择事件
			registerPageSelectEvent: function() {
				$('#pagesizelist').change(function() {
					_op.settings.pagesize = parseInt($('#pagesizelist').val());
					_op.createTableBody(1);
				})
			},
			//添加异步ajax事件
			getAjaxDate: function(url, parms) {
				//定义一个全局变量来接受$post的返回值
				var result;
				//用ajax的同步方式
				$.ajax({
					url: url,
					async: false,
					//改为同步方式
					data: parms,
					success: function(data) {
						result = data;
					}
				});
				return result;
			},
			//给表头绑定点击事件
			registerThEvent: function() {
				$("table[id=" + this._id + "] thead th").click(function() {
					if(_op.settings.sort == true) {
						var idx1, idx2;
						$.each(_op.settings.columns, function(i, e) {
							if(e.field == 'ck') {
								idx1 = i;
							} else if(e.field == 'handle') {
								idx2 = i;
							}
						})
						if($(this).index() == idx1 || $(this).index() == idx2) return
						_op.sort($(this).index());
					}
				})
			},
			//排序
			sort: function(Idx) {
				var table = document.getElementById(this._id);
				var tbody = table.tBodies[0];
				var tr = tbody.rows;
				var trValue = new Array();
				for(var i = 0; i < tr.length; i++) {
					trValue[i] = tr[i]; //将表格中各行的信息存储在新建的数组中
				}
				if(tbody.sortCol == Idx) {
					trValue.reverse(); //如果该列已经进行排序过了，则直接对其反序排列
				} else {
					//进行排序
					trValue.sort(function(tr1, tr2) {
						var value1 = tr1.cells[Idx].innerHTML;
						var value2 = tr2.cells[Idx].innerHTML;
						if(isNaN(value1) && isNaN(value2)) {
							return value1.localeCompare(value2);
						} else {
							return value1 - value2;
						}
					});
				}

				var fragment = document.createDocumentFragment(); //新建一个代码片段，用于保存排序后的结果
				for(var i = 0; i < trValue.length; i++) {
					fragment.appendChild(trValue[i]);
				}

				tbody.appendChild(fragment); //将排序的结果替换掉之前的值
				tbody.sortCol = Idx;
			},
			//输入页码  回车事件进行跳转
			enterForPageEvent: function() {
				//输入页码框聚焦 点击回车事件
				$(document).on('keyup', function(event) {
					if(event.keyCode == 13 && $("table[id='" + _op._id + "'] tfoot tr td input").is(":focus")) {
						$('#skippage').trigger('click');
					}
				});
			},
		}

		$.fn.grid = function(options) {
			var grid = new dataGrid(this, options);
			return this.each(function() {
				grid.init();
			});
		}
	})
})(window)