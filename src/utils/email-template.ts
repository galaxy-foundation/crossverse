export const Html_Register = `<table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;font-family:Microsoft Yahei,Arial, Helvetica, sans-serif;padding:0;margin:0;color:#333;background-color:#f7f7f7;background-repeat:repeat-x;background-position:bottom left;">
	<tbody>
		<tr>
			<td>
				<table width="600" border="0" align="center" cellpadding="0" cellspacing="0">
					<tbody>
						<tr>
							<td align="center" valign="middle" style="padding:33px 0;">
								<a href="{{website}}/" target="_blank"><img src="{{website}}/images/logo.png" width="300" height="auto" alt="crossverse" style="border:0;"></a>
							</td>
						</tr>
						<tr>
							<td>
								<div style="padding:0 30px;background:#fff;box-shadow:0 0 5px #eee;">
									<table width="100%" border="0" cellspacing="0" cellpadding="0">
										<tbody>
											<tr>
												<td style="border-bottom: 1px solid #e6e6e6;font-size:18px;padding:20px 0;">
													<table border="0" cellspacing="0" cellpadding="0" width="100%">
														<tbody>
															<tr>
																<td>Verify your registration!</td>
																<td> </td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;line-height:30px;color:#666;">
													<br>Hi {{name}}, <br> <br>
													Please use the following code to verify your login 
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;line-height:30px;padding:0 0 20px;color:#666;">
													Verification code: 
												</td>
											</tr>
											<tr>
												<td>
													<span style="padding:5px 0;font-size: 20px;font-weight: bolder;color:#e9b434;">{{code}}</span>
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;padding:20px 0 10px 0;line-height:26px;color:#666;">
													The verification code will be valid for 30 minutes.<br>
													Please do not share this code with anyone.
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;padding:30px 0 15px 0;font-size:12px;color:#999;line-height:20px;">
													{{team}}<br>
													This is an automated message, please do not reply. 
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</td>
						</tr>
						<tr>
							<td align="center" style="font-size:12px;color:#999;padding:20px 0;">
								© 2017 - 2021 {{domain}} All Rights Reserved<br>
								URL: <a style="color:#999;text-decoration:none;" href="{{website}}/" target="_blank">{{domain}}</a>&nbsp;&nbsp;
								E-mail: <a href="mailto:{{support}}" style="color:#999;text-decoration:none;">{{support}}</a>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>`;

export const Html_Reset = `<table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;font-family:Microsoft Yahei,Arial, Helvetica, sans-serif;padding:0;margin:0;color:#333;background-color:#f7f7f7;background-repeat:repeat-x;background-position:bottom left;">
	<tbody>
		<tr>
			<td>
				<table width="600" border="0" align="center" cellpadding="0" cellspacing="0">
					<tbody>
						<tr>
							<td align="center" valign="middle" style="padding:33px 0;">
								<a href="{{website}}/" target="_blank"><img src="{{website}}/images/logo.png" width="300" height="auto" alt="crossverse" style="border:0;"></a>
							</td>
						</tr>
						<tr>
							<td>
								<div style="padding:0 30px;background:#fff;box-shadow:0 0 5px #eee;">
									<table width="100%" border="0" cellspacing="0" cellpadding="0">
										<tbody>
											<tr>
												<td style="border-bottom: 1px solid #e6e6e6;font-size:18px;padding:20px 0;">
													<table border="0" cellspacing="0" cellpadding="0" width="100%">
														<tbody>
															<tr>
																<td>Reset your password!</td>
																<td> </td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;line-height:30px;color:#666;">
													<br>Hi {{name}}, <br> <br>
													We heard that you lost your {{domain}} password. Sorry about that!<br>
													But don’t worry!<br>
													
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;line-height:30px;padding:0 0 20px;color:#666;">
													Here is your new Password: 
												</td>
											</tr>
											<tr>
												<td>
													<span style="padding:5px 0;font-size: 20px;font-weight: bolder;color:#e9b434;">{{password}}</span>
												</td>
											</tr>
											<tr>
												<td style="font-size:14px;padding:30px 0 15px 0;font-size:12px;color:#999;line-height:20px;">
													{{team}}<br>
													This is an automated message, please do not reply. 
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</td>
						</tr>
						<tr>
							<td align="center" style="font-size:12px;color:#999;padding:20px 0;">
								© 2017 - 2021 {{domain}} All Rights Reserved<br>
								URL: <a style="color:#999;text-decoration:none;" href="{{website}}/" target="_blank">{{domain}}</a>&nbsp;&nbsp;
								E-mail: <a href="mailto:{{support}}" style="color:#999;text-decoration:none;">{{support}}</a>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>`;
