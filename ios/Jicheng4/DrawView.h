//
//  DrawView.h
//  Jicheng1
//
//  Created by guojicheng on 16/8/24.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>

#define PI 3.14159265358979323846

@interface DrawView : UIView

@property (nonatomic, assign) CGRect clipping;
@property (nonatomic, strong) NSDictionary* drawData;
@property (nonatomic, assign) CGPoint transPos;
@property (nonatomic, assign) CGPoint scaleValue;

@end
