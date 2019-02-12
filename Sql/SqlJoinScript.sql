
SELECT * FROM GroupCreate
LEFT JOIN UserInfo
ON UserInfo.UserID = GroupCreate.UserInfo_UserID
LEFT JOIN GroupInfo 
ON GroupInfo.GroupID = GroupCreate.GroupInfo_GroupID
Where GroupName like "PointPark"