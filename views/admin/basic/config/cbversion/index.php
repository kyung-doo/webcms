<div class="box">
    <div class="box-table">
        <div class="table-responsive">
            <table class="table table-bordered table-hover table-striped">
                <tbody>
                    <tr>
                        <td style="line-height:200%;padding:30px;">
                            현재 설치되어있는 씨아이보드 버전은 <?php echo CB_PACKAGE . ' ' . CB_VERSION; ?> 입니다. <br />
                            <?php
                            if (version_compare(element('latest_version_name', $view), CB_VERSION) > 0) {
                            ?>
                                설치할 수 있는 최신버전은 <?php echo CB_PACKAGE . ' ' . element('latest_version_name', $view); ?> 입니다. <br />
                                <a href="<?php echo element('latest_download_url', $view); ?>" target="_blank" class="btn btn-success btn-xs">최신버전 설치하러 가기</a>
                            <?php } else { ?>
                                현재 최신 버전이 설치되어 있습니다.
                            <?php } ?>
                        </td>
                    </tr>
                    <?php
                    if ( strtolower(CB_PACKAGE) === 'basic') {
                    ?>
                        <tr>
                            <td style="line-height:200%;padding:30px;">
                                회원님은 현재 BASIC Package 를 사용중이십니다. <br />
                                PREMIUM Package 를 사용하시면 더 좋은 기능을 체험하실 수 있습니다. <br />
                                <a href="<?php echo element('premium_downloadurl', element('latest_versions', $view)); ?>" target="_blank" class="btn btn-warning btn-xs">PREMIUM Version 다운로드 받으러 가기</a>
                            </td>
                        </tr>
                    <?php
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
