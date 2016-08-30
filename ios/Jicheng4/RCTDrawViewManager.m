//
//  RCTDrawViewManager.m
//  Jicheng1
//
//  Created by guojicheng on 16/8/24.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "RCTUIManager.h"

#import "RCTDrawViewManager.h"
#import "RCTDrawView.h"



//typedef double TransXY;
//@implementation RCTConvert(DrawView)
//
//RCT_CONVERTER(TransXY, TransXY, doubleValue);
//
//+(TransPos)TransPos:(id)json
//{
//  json = [self NSDictionary:json];
//  TransPos tp = {
//    [self TransXY:json[@"tx"]],
//    [self TransXY:json[@"ty"]]
//  };
//  return tp;
//}
//@end


@implementation RCTDrawViewManager

RCT_EXPORT_MODULE();
@synthesize bridge = _bridge;

- (UIView *)view
{
  return [[RCTDrawView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(drawData, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(transPos, CGPoint);
RCT_EXPORT_VIEW_PROPERTY(scaleValue, CGPoint);
//RCT_CUSTOM_VIEW_PROPERTY(transPos, TransPos, RCTDrawView)
//{
//  [view setTransPos:json ? [RCTConvert TransPos:json] : defaultView.transPos];
//}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

@end
