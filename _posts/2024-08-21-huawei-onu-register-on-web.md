---
layout: post
title: 华为光猫(ONU) 跨运营商认证
subtitle: 通过纯web界面修改不需要telnet或SSH
private: true
# feature-img: 
---

## 光猫认证的方式

ONT认证就是光猫和运营商设备进行注册和通信, 除了移动使用Paswor 认证外，大部分使用Loid认证，部分地区绑定MAC和SN。

| 运营商 | PON 协议 | 认证方式 | 说明 |
| ------ |---| -------- | ---- |
| 电信  | G/E 都有 | 逻辑ID(即Loid) + Loid密码 (部分地区空) | 少数地区绑定SN |
| 移动  | GPON | Password密码 + SN 或者 LoId| 部分地区切换XGPON线路需要解绑,部分省用Loid |
| 联通  | G/E 都有 | loid + SN,(北京联通绑定MAC无Loid) | 部分地方绑定设备标识, |

更换光猫就需要确认线路是否支持，认证方式是否可以修改。

## 默认超级账号和密码

部分光猫可以通过长按重置键盘恢复初始密码(部分地区型号可能无法修改，北京联通没有超级账户)。
重置后即可使用默认管理员账号进入后台。

华为不同运营商版本得常用超级密码

| 版本 | 默认超级账号 | 默认密码 | 地址 |备注 |
| ------ | ------------ | --------|--- | ----- |
| 移动   | CMCCAdmin    | aDm8H%MdA | http://192.168.1.1  | 部分型号同普通密码 |
| 电信   | telecomadmin | nE7jA%5m |http://192.168.1.1:8080 | 部分是80端口 |
| 联通   | CUAdmin      | CUAdmin | http://192.168.1.1/cu.html  |部分密码可一样 |
| 华为(运营商)| telecomadmin | admintelecom | https://192.168.100.1:80 | 部分型号同普通密码 |
| 华为(企业版)| Epadmin | adminEp | http://192.168.18.1 | 部分是https |

## Web 修改运营商方式

从R22之后，开telnet和刷入shell已经非常困难了。
这种方法可以让目前的大部分V5版华光猫都可以在web界面直接修改 LOID (Loid,LoidPassword)和(Password,SN)实现跨运营商使用.

通过公版的页面我们可以找到`/html/amp/ontauth/password.asp`的iframe页面。

通过分析旧版固件可以找到这个文件。
![ont-auth](/assets/img/huawei-onu-register-on-web/html-ont-password.png)


管理员账户登录，**打开路径 <http://192.168.1.1/html/amp/ontauth/password.asp>**,即可修改。(截图为联通版界面)

![ont-auth](/assets/img/huawei-onu-register-on-web/ontauth-password.png)

## 补充

### JS提交

这里是原始代码关于光猫认证的配置页，里面其实有更多的认证方式。

```asp
<tr id="TrAuthmode"> 
            <td BindText='amp_auth_mode'></td>
            <td id="TrTdAuthmode" > 
            	<select name="Authmode" size="1" id="Authmode" onchange="OnChangeMode()">
	                <option value="0" BindText='amp_auth_ctclogic' selected></option>
	                <option value="1" BindText='amp_auth_hwkey'></option>
              	</select>
            </td>
          </tr>
          
          <tr id="TrLoid"> 
            <td BindText='amp_scenario_loid'></td>
            <td > <input type="text" name="LOIDValue" id="LOIDValue"  maxlength="24"> </td>
			<td BindText='amp_loid_note'></td>
          </tr>
          
          <tr id="TrPasswordmode"> 
            <td BindText='amp_passwd_mode'></td>
            <td id="TrTdPasswordmode" > 
              <select name="Passwordmode" size="1" id="Passwordmode" onChange="OnChangeMode1()">
                <option value="0" BindText='amp_char_mode' selected="selected"></option>
                <option value="1" BindText='amp_hex_mode'></option>
              </select>
            </td>
          </tr>
          
          <tr id="TrPasswordEpon"> 
            <td BindText='amp_pass_word'></td>
            <td>
              <input name="PwdEponValue" type="password" autocomplete="off" id="PwdEponValue" maxlength="12" onchange="eponpassword=getValue('PwdEponValue');getElById('tPwdEponValue').value = eponpassword;"/> 
              <input name="tPwdEponValue" type="text" id="tPwdEponValue" maxlength="12" style="display:none" onchange="eponpassword=getValue('tPwdEponValue');getElById('PwdEponValue').value = eponpassword;"/> 
            </td>
            <td>
    		  <input checked type="checkbox" id="hidePwdEponValue" name="hidePwdEponValue" value="on" onClick="ShowOrHideText('hidePwdEponValue', 'PwdEponValue', 'tPwdEponValue', eponpassword);" style="margin-right:-2px"/> 
    			  <script>
    			  	document.write(cfg_ontauth_language['amp_password_hide']);
    			  	document.write(cfg_ontauth_language['amp_passwd_note1']);
    			  </script>
            </td>
          </tr>
          
          <tr id="TrPasswordGpon"> 
            <td BindText='amp_pass_word'></td>
            <td> 
            	<input name="PwdGponValue" type="password" autocomplete="off" id="PwdGponValue" maxlength="10" onchange="gponpassword=getValue('PwdGponValue'); getElById('tPwdGponValue').value = gponpassword;hexgponpassword = ChangeAsciitoHex(gponpassword); getElById('tHexPwdValue').value = hexgponpassword; getElById('HexPwdValue').value = hexgponpassword;"/> 
                <input name="tPwdGponValue" type="text" id="tPwdGponValue" maxlength="10" style="display:none" onchange="gponpassword=getValue('tPwdGponValue');getElById('PwdGponValue').value = gponpassword;hexgponpassword = ChangeAsciitoHex(gponpassword);getElById('tHexPwdValue').value = hexgponpassword;getElById('HexPwdValue').value = hexgponpassword;"/> 
            </td>
            <td>
              	<input checked type="checkbox" id="hidePwdGponValue" name="hidePwdGponValue" value="on" onClick="ShowOrHideText('hidePwdGponValue', 'PwdGponValue', 'tPwdGponValue', gponpassword);" style="margin-right:-2px"/>
    			  <script>
    			  	document.write(cfg_ontauth_language['amp_password_hide']);
    			  	document.write(cfg_ontauth_language['amp_passwd_note2']);
    			  </script>
            </td>
          </tr>
          
          <tr id="TrHexPassword"> 
            <td BindText='amp_pass_word'></td>
            <td> 
               <input name="HexPwdValue" type="password" autocomplete="off" id="HexPwdValue" maxlength="20" onchange="hexgponpassword=getValue('HexPwdValue');getElById('tHexPwdValue').value = hexgponpassword;gponpassword = ChangeHextoAscii(hexgponpassword);getElById('PwdGponValue').value = gponpassword;getElById('tPwdGponValue').value = gponpassword;"/> 
               <input name="tHexPwdValue" type="text" id="tHexPwdValue" maxlength="20"  style="display:none" onchange="hexgponpassword=getValue('tHexPwdValue');getElById('HexPwdValue').value = hexgponpassword;gponpassword = ChangeHextoAscii(hexgponpassword);getElById('PwdGponValue').value = gponpassword;getElById('tPwdGponValue').value = gponpassword;"/> 
            </td>
            <td>
            	<input checked type="checkbox" id="hideHexPwdValue" name="hideHexPwdValue" value="on" onClick="ShowOrHideText('hideHexPwdValue', 'HexPwdValue', 'tHexPwdValue', hexgponpassword);" />
	  			  <script>
	  			  	document.write(cfg_ontauth_language['amp_password_hide']);
	  			  	document.write(cfg_ontauth_language['amp_passwd_note3']);
	  			  </script>
            </td>
          </tr>
          
	      <tr id="TrMutualAuth" style="display:none"> 
            <td BindText='amp_mutual_auth'></td>
            <td id="TrTdMutualAuth" >
            	<input checked type="checkbox" id="MutualAuth" name="MutualAuth" value="on" onClick="onMutualAuthSwitch()"/> 
            </td>
          </tr>
          
		  <tr id="TrRegisterId" style="display:none"> 
            <td BindText='amp_pass_word'></td>
            <td> 
				<input name="RegisterId" type="password" autocomplete="off" id="RegisterId" maxlength="36" onchange="xgponregisterid=getValue('RegisterId');getElById('tRegisterId').value = xgponregisterid;"/> 
				<input name="tRegisterId" type="text" id="tRegisterId" maxlength="36"  style="display:none" onchange="xgponregisterid=getValue('tRegisterId');getElById('RegisterId').value = xgponregisterid;"/> 
            </td>
            <td>
            	<input checked type="checkbox" id="hideRegisterId" name="hideRegisterId" value="on" onClick="ShowOrHideText('hideRegisterId', 'RegisterId', 'tRegisterId', xgponregisterid);" style="margin-right:-2px"/> 
  			  <script>
  			     document.write(cfg_ontauth_language['amp_password_hide']);
  			     document.write(cfg_ontauth_language['amp_registerid_note']);
  			  </script>
            </td>
          </tr>
          
		  <tr id="TrPSK" style="display:none"> 
            <td BindText='amp_pass_word'></td>
            <td> 
            	<input name="Psk" type="password" autocomplete="off" id="Psk" maxlength="16" onchange="xgponpsk=getValue('Psk');getElById('tPsk').value = xgponpsk;"/> 
              	<input name="tPsk" type="text" id="tPsk" maxlength="16"  style="display:none" onchange="xgponpsk=getValue('tPsk');getElById('Psk').value = xgponpsk;"/> 
            </td>
            <td>
                <input checked type="checkbox" id="hidePsk" name="hidePsk" value="on" onClick="ShowOrHideText('hidePsk', 'Psk', 'tPsk', xgponpsk);" style="margin-right:-2px"/>
  				  <script>
  				  	document.write(cfg_ontauth_language['amp_password_hide']);
  				  	document.write(cfg_ontauth_language['amp_psk_note']);
  				  </script>
            </td>
          </tr>		  
		  
          <tr id="TrSN"> 
            <td><script>document.write(cfg_ontauth_language['amp_scenario_sn']);</script></td>
            <td> 
	             <script>
	              if(1 == TelMexFlag)
	              {
	            	  document.write('<input type="text" name="SNValue1" id="SNValue1"  maxlength="4" style="width:50px">');
	                  document.write('<input type="text" name="SNValue2" id="SNValue2"  maxlength="8" style="width:68px">');                
	              }
	              else
	              {
	            	  document.write('<input type="text" name="SNValue" id="SNValue"  maxlength="16" >');                
	              }
	              </script>
			 </td>
            <td>
                <font style="color: red;">*</font>
                <script>
    			  if(1 == TelMexFlag)
    			  {
    			  		document.write(cfg_ontauth_language['amp_telmexsn_note']);
    			  }
    			  else
    			  {
    			  		document.write(cfg_ontauth_language['amp_passwd_note4']);
    			  }
  			  </script>
            </td>
          </tr>
          
          <tr id="TrHwkey"> 
            <td BindText='amp_ontauth_hwkey'></td>
            <td> <input type="text" name="HwkeyValue" id="HwkeyValue" maxlength="32"></td>
            <td BindText='amp_passwd_note5'></td>
          </tr>
          
		  <tr id="tr_guide_apply" style="display:none;">
			<td></td>
			<td  colspan="2" style="padding-top: 20px;">
				<input type="hidden" name="gd_onttoken" id="gd_hwonttoken" value="<%HW_WEB_GetToken();%>">
				<input id="pre" type="button" class="CancleButtonCss buttonwidth_100px" style="margin-left:0px;" BindText="amp_wifiguide_prestep" onClick="window.parent.location.href='../../ssmp/cfgguide/guideindex.asp';">
				<input id="guidewancfg" type="button" class="ApplyButtoncss buttonwidth_100px" BindText="amp_wifiguide_nextstep" name="../../html/bbsp/wan/wan.asp?cfgguide=1" onClick="Submit();">
				<a id="a_skip" href="#" style="display:block; margin-top: -28px;margin-left: 230px;font-size:16px;text-decoration: none;color: #666666;width: 35px;" onclick="window.parent.onchangestep(window.parent.wifiPara);"><script>document.write(cfg_ontauth_language['amp_wifiguide_skip']);</script></a>
			</td>
	    </tr>
```

也可以直接在网页的console调试中执行JS，来修改:

```js
fetch("/html/amp/ontauth/set.cgi?x=InternetGatewayDevice.DeviceInfo&RequestFile=html/amp/ontauth/password.asp", {
  headers: {
    "content-type": "application/x-www-form-urlencoded",
  },
  body: "x.X_HW_PonHexPassword={PASSWORD_HEX}&x.X_HW_PonSN={SN_HEX}&x.X_HW_ForceSet=1&x.X_HW_Token={TOKEN_IN_THE_PAGE}",
  method: "POST",
  mode: "cors",
  credentials: "include"
})
```

### 上行口的修改（待验证）

分析固件可以通过 http://192.168.1.1/html/ssmp/mainupportcfg/mainupportconfig.asp 修改上行口，(暂时无法验证)

