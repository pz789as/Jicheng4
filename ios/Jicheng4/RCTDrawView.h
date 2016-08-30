//
//  RCTDrawView.h
//  Jicheng1
//
//  Created by guojicheng on 16/8/24.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "RCTView.h"

#import "DrawView.h"

//typedef struct TransPosition
//{
//  CGFloat tx;
//  CGFloat ty;
//}TransPos;

static NSString *const RCTBackgroundColorProp = @"backgroundColor";

@interface RCTDrawView : UIView

@property (nonatomic, strong) DrawView *drawView;
//@property (nonatomic, assign) TransPos transPos;

@end
