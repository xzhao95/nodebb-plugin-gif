<form role="form" class="tenor-gif-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">General</div>
		<div class="col-sm-10 col-xs-12">
			<p class="lead">
				<p>参数：query：搜索字段， page：页码</p>
				<p>返回：promise对象，</p>
				<p>promise的resolve格式：{gifs(表情包列表): [{</p>
				<p>&nbsp;&nbsp;main: 表情地址</p>
				<p>&nbsp;&nbsp;gif_thumb： 表情压缩地址</p>
				<p>}]}</p>
			</p>
			<div class="form-group">
				<label for="code">code</label>
				<textarea type="text" id="code" name="code" title="code" class="form-control"
					placeholder="submit code"></textarea>
			</div>
		</div>
	</div>
</form>

<button id="save"
	class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>